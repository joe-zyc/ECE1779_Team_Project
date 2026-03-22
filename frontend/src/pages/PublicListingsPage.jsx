import { useCallback, useEffect, useRef, useState } from "react";

import ListingCard from "../components/ListingCard";
import Notice from "../components/Notice";
import { listingsApi } from "../api/client";

const PAGE_SIZE = 5;
const CAR_MAKER_OPTIONS = [
  "Acura",
  "Alfa Romeo",
  "Audi",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Dodge",
  "Fiat",
  "Ford",
  "Genesis",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Mazda",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Porsche",
  "Ram",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];
const BODY_TYPE_OPTIONS = ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Truck", "Van", "Wagon"];
const COLOR_OPTIONS = ["Black", "White", "Silver", "Gray", "Blue", "Red", "Green", "Brown", "Beige", "Orange", "Yellow"];

const initialFilters = {
  make: "",
  model: "",
  trim: "",
  bodyType: "",
  color: "",
  yearMin: "",
  yearMax: "",
  mileageMin: "",
  mileageMax: "",
  priceMin: "",
  priceMax: "",
};

function normalizeFilters(filters) {
  const normalized = { ...initialFilters };

  Object.keys(initialFilters).forEach((key) => {
    normalized[key] = String(filters?.[key] ?? "").trim();
  });

  return normalized;
}

function toLikePattern(value) {
  const trimmed = String(value || "").trim();
  return trimmed ? `%${trimmed}%` : undefined;
}

function toNumericFilter(value) {
  if (value === "") {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isNaN(numeric) ? undefined : numeric;
}

function mapSortToApi(sortKey) {
  if (sortKey === "priceAsc") {
    return { sort: "price", order: "asc" };
  }
  if (sortKey === "priceDesc") {
    return { sort: "price", order: "desc" };
  }
  if (sortKey === "yearDesc") {
    return { sort: "year", order: "desc" };
  }
  if (sortKey === "mileageAsc") {
    return { sort: "mileage_km", order: "asc" };
  }

  return { sort: "published_at", order: "desc" };
}

function buildQueryParams(filters, sortKey, page) {
  const sort = mapSortToApi(sortKey);

  return {
    ...sort,
    page,
    limit: PAGE_SIZE,
    make: toLikePattern(filters.make),
    model: toLikePattern(filters.model),
    trim: toLikePattern(filters.trim),
    bodyType: toLikePattern(filters.bodyType),
    color: toLikePattern(filters.color),
    yearMin: toNumericFilter(filters.yearMin),
    yearMax: toNumericFilter(filters.yearMax),
    mileageMin: toNumericFilter(filters.mileageMin),
    mileageMax: toNumericFilter(filters.mileageMax),
    priceMin: toNumericFilter(filters.priceMin),
    priceMax: toNumericFilter(filters.priceMax),
  };
}

function SuggestionInput({ label, name, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const normalizedValue = String(value || "").trim().toLowerCase();
  const visibleOptions = options
    .filter((option) => option.toLowerCase().includes(normalizedValue))
    .slice(0, 8);

  return (
    <label>
      {label}
      <div className="suggestion-input" ref={wrapperRef}>
        <input
          name={name}
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
        />
        {isOpen && visibleOptions.length > 0 && (
          <div className="suggestion-menu" role="listbox" aria-label={`${label} suggestions`}>
            {visibleOptions.map((option) => (
              <button
                key={option}
                type="button"
                className="suggestion-option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}

export default function PublicListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterInputs, setFilterInputs] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [sortKey, setSortKey] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(PAGE_SIZE);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const latestRequestRef = useRef(0);

  const loadListings = useCallback(async () => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    setLoading(true);
    setError("");

    try {
      const response = await listingsApi.listPublic(buildQueryParams(activeFilters, sortKey, page));
      const nextListings = Array.isArray(response.data) ? response.data : [];
      const apiLimit = Number(response?.pagination?.limit);
      const safeLimit = Number.isFinite(apiLimit) && apiLimit > 0 ? apiLimit : PAGE_SIZE;

      if (requestId !== latestRequestRef.current) {
        return;
      }

      setListings(nextListings);
      setPageLimit(safeLimit);
      setHasNextPage(nextListings.length >= safeLimit);
    } catch (loadError) {
      if (requestId !== latestRequestRef.current) {
        return;
      }
      setError(loadError.message || "Failed to load listings.");
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, [activeFilters, page, sortKey]);

  useEffect(() => {
    loadListings();
  }, [loadListings, refreshTick]);

  function updateFilterInput(field, value) {
    setFilterInputs((current) => ({ ...current, [field]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    const normalizedFilters = normalizeFilters(filterInputs);
    setFilterInputs(normalizedFilters);
    setActiveFilters(normalizedFilters);
    setPage(1);
    setRefreshTick((current) => current + 1);
  }

  function clearFilters() {
    const resetFilters = { ...initialFilters };
    setFilterInputs(resetFilters);
    setActiveFilters(resetFilters);
    setPage(1);
    setRefreshTick((current) => current + 1);
  }

  function refreshListings() {
    const normalizedFilters = normalizeFilters(filterInputs);
    setFilterInputs(normalizedFilters);
    setActiveFilters(normalizedFilters);
    setPage(1);
    setRefreshTick((current) => current + 1);
  }

  return (
    <section className="stack-lg">
      <div className="hero-panel">
        <p className="eyebrow">Marketplace</p>
        <h1>Used cars, clearly organized for fast decisions.</h1>
      </div>

      <form className="control-strip" onSubmit={applyFilters}>
        <SuggestionInput
          label="Make"
          name="make"
          value={filterInputs.make}
          onChange={(value) => updateFilterInput("make", value)}
          options={CAR_MAKER_OPTIONS}
          placeholder="Select or type"
        />

        <label>
          Model
          <input
            name="model"
            type="text"
            value={filterInputs.model}
            onChange={(event) => updateFilterInput("model", event.target.value)}
            placeholder="e.g. Corolla"
          />
        </label>

        <label>
          Trim
          <input
            name="trim"
            type="text"
            value={filterInputs.trim}
            onChange={(event) => updateFilterInput("trim", event.target.value)}
            placeholder="e.g. LE"
          />
        </label>

        <SuggestionInput
          label="Body Type"
          name="body_type"
          value={filterInputs.bodyType}
          onChange={(value) => updateFilterInput("bodyType", value)}
          options={BODY_TYPE_OPTIONS}
          placeholder="Select or type"
        />

        <SuggestionInput
          label="Color"
          name="color"
          value={filterInputs.color}
          onChange={(value) => updateFilterInput("color", value)}
          options={COLOR_OPTIONS}
          placeholder="Select or type"
        />

        <label>
          Min Price (CAD)
          <input
            name="min_price"
            type="number"
            min="0"
            value={filterInputs.priceMin}
            onChange={(event) => updateFilterInput("priceMin", event.target.value)}
            placeholder="Optional…"
          />
        </label>

        <label>
          Max Price (CAD)
          <input
            name="max_price"
            type="number"
            min="0"
            value={filterInputs.priceMax}
            onChange={(event) => updateFilterInput("priceMax", event.target.value)}
            placeholder="Optional…"
          />
        </label>

        <label>
          Min Year
          <input
            name="min_year"
            type="number"
            min="1900"
            value={filterInputs.yearMin}
            onChange={(event) => updateFilterInput("yearMin", event.target.value)}
            placeholder="Optional…"
          />
        </label>

        <label>
          Max Year
          <input
            name="max_year"
            type="number"
            min="1900"
            value={filterInputs.yearMax}
            onChange={(event) => updateFilterInput("yearMax", event.target.value)}
            placeholder="Optional…"
          />
        </label>

        <label>
          Min Mileage (km)
          <input
            name="min_mileage"
            type="number"
            min="0"
            value={filterInputs.mileageMin}
            onChange={(event) => updateFilterInput("mileageMin", event.target.value)}
            placeholder="Optional…"
          />
        </label>

        <label>
          Max Mileage (km)
          <input
            name="max_mileage"
            type="number"
            min="0"
            value={filterInputs.mileageMax}
            onChange={(event) => updateFilterInput("mileageMax", event.target.value)}
            placeholder="Optional…"
          />
        </label>

        <label>
          Sort
          <select
            name="sort"
            value={sortKey}
            onChange={(event) => {
              setSortKey(event.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Newest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="yearDesc">Year: New to Old</option>
            <option value="mileageAsc">Mileage: Low to High</option>
          </select>
        </label>

        <button className="button" type="submit">
          Apply Filters
        </button>

        <button className="button button-subtle" type="button" onClick={clearFilters}>
          Clear
        </button>

        <button className="button button-subtle" type="button" onClick={refreshListings}>
          Refresh
        </button>
      </form>

      {error && <Notice kind="error">{error}</Notice>}

      {loading && <p className="muted">Loading Listings…</p>}

      {!loading && listings.length === 0 && page === 1 && (
        <Notice kind="info">No listings match your current filters.</Notice>
      )}
      {!loading && listings.length === 0 && page > 1 && (
        <Notice kind="info">No more listings on this page. Try Previous or refine your filters.</Notice>
      )}

      <div className="listing-grid">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} actions={[]} />
        ))}
      </div>

      {!loading && (listings.length > 0 || page > 1) && (
        <div className="pagination-bar">
          <button
            className="button button-subtle"
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <p className="muted">
            Page {page} ({listings.length} results)
          </p>
          <button
            className="button button-subtle"
            type="button"
            disabled={!hasNextPage || listings.length < pageLimit}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
