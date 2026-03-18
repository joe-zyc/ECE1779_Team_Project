import { useEffect, useMemo, useState } from "react";

import ListingCard from "../components/ListingCard";
import Notice from "../components/Notice";
import { listingsApi } from "../api/client";

const PAGE_SIZE = 5;

function compareListings(sortKey, left, right) {
  if (sortKey === "priceAsc") {
    return Number(left.price || 0) - Number(right.price || 0);
  }
  if (sortKey === "priceDesc") {
    return Number(right.price || 0) - Number(left.price || 0);
  }
  if (sortKey === "yearDesc") {
    return Number(right.year || 0) - Number(left.year || 0);
  }
  if (sortKey === "mileageAsc") {
    return Number(left.mileage_km || 0) - Number(right.mileage_km || 0);
  }

  const leftTime = new Date(left.published_at || left.created_at || 0).getTime();
  const rightTime = new Date(right.published_at || right.created_at || 0).getTime();
  return rightTime - leftTime;
}

export default function PublicListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);

  async function loadListings() {
    setLoading(true);
    setError("");

    try {
      const response = await listingsApi.listPublic();
      setListings(Array.isArray(response.data) ? response.data : []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    const minCandidate = minPrice === "" ? null : Number(minPrice);
    const cap = maxPrice === "" ? null : Number(maxPrice);
    const hasMin = minCandidate !== null && !Number.isNaN(minCandidate);
    const hasMax = cap !== null && !Number.isNaN(cap);
    const lowerBound = hasMin && hasMax ? Math.min(minCandidate, cap) : minCandidate;
    const upperBound = hasMin && hasMax ? Math.max(minCandidate, cap) : cap;

    return [...listings]
      .filter((listing) => {
        if (lowered) {
          const haystack = [listing.make, listing.model, listing.trim, listing.color]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!haystack.includes(lowered)) {
            return false;
          }
        }

        const price = Number(listing.price || 0);
        if (lowerBound !== null && !Number.isNaN(lowerBound) && price < lowerBound) {
          return false;
        }
        if (upperBound !== null && !Number.isNaN(upperBound) && price > upperBound) {
          return false;
        }

        return true;
      })
      .sort((a, b) => compareListings(sortKey, a, b));
  }, [listings, minPrice, maxPrice, query, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedListings = filteredListings.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, minPrice, maxPrice, sortKey]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  return (
    <section className="stack-lg">
      <div className="hero-panel">
        <p className="eyebrow">Marketplace</p>
        <h1>Used cars, clearly organized for fast decisions.</h1>
        <p>
          Browse all published listings. Seller and buyer tools unlock after sign-in based on your role.
        </p>
      </div>

      <div className="control-strip">
        <label>
          Search
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="make, model, trim, color"
          />
        </label>

        <label>
          Min Price (CAD)
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="optional"
          />
        </label>

        <label>
          Max Price (CAD)
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="optional"
          />
        </label>

        <label>
          Sort
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
            <option value="newest">Newest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="yearDesc">Year: New to Old</option>
            <option value="mileageAsc">Mileage: Low to High</option>
          </select>
        </label>

        <button className="button" onClick={loadListings}>
          Refresh
        </button>
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      {loading && <p className="muted">Loading listings...</p>}

      {!loading && filteredListings.length === 0 && (
        <Notice kind="info">No listings match your current filters.</Notice>
      )}

      <div className="listing-grid">
        {pagedListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} actions={[]} />
        ))}
      </div>

      {!loading && filteredListings.length > 0 && (
        <div className="pagination-bar">
          <button
            className="button button-subtle"
            disabled={currentPage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <p className="muted">
            Page {currentPage} of {totalPages}
          </p>
          <button
            className="button button-subtle"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
