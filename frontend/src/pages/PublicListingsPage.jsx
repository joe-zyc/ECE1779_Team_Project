import { useEffect, useMemo, useState } from "react";

import ListingCard from "../components/ListingCard";
import Notice from "../components/Notice";
import { listingsApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

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
  const { isAuthenticated, role, requestWithAuth } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [maxPrice, setMaxPrice] = useState("");

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

  const visibleListings = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    const cap = maxPrice === "" ? null : Number(maxPrice);

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

        if (cap !== null && !Number.isNaN(cap)) {
          const price = Number(listing.price || 0);
          if (price > cap) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => compareListings(sortKey, a, b));
  }, [listings, maxPrice, query, sortKey]);

  async function reportListing(listingId) {
    setInfo("");
    setError("");

    try {
      await requestWithAuth(`/listings/${listingId}/report`, { method: "POST" });
      setInfo("Report submitted. Thanks for keeping the marketplace healthy.");
      await loadListings();
    } catch (reportError) {
      setError(reportError.message || "Could not submit report.");
    }
  }

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

      {info && <Notice kind="success">{info}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      <div className="metrics-row">
        <article>
          <p className="metric-label">Listings visible</p>
          <p className="metric-value">{visibleListings.length}</p>
        </article>
        <article>
          <p className="metric-label">Auth status</p>
          <p className="metric-value">{isAuthenticated ? "Signed In" : "Guest"}</p>
        </article>
        <article>
          <p className="metric-label">Role mode</p>
          <p className="metric-value">{role || "guest"}</p>
        </article>
      </div>

      {loading && <p className="muted">Loading listings...</p>}

      {!loading && visibleListings.length === 0 && (
        <Notice kind="info">No listings match your current filters.</Notice>
      )}

      <div className="listing-grid">
        {visibleListings.map((listing) => {
          const actions = [];

          if (isAuthenticated && role === "buyer") {
            actions.push({
              label: "Report",
              variant: "danger",
              onClick: () => reportListing(listing.id),
            });
          }

          return <ListingCard key={listing.id} listing={listing} actions={actions} />;
        })}
      </div>
    </section>
  );
}
