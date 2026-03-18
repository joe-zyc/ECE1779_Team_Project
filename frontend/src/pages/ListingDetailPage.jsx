import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Notice from "../components/Notice";
import { listingsApi } from "../api/client";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, "")
  : "http://localhost:3001";

function toCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function imageHref(storagePath) {
  if (!storagePath) {
    return "";
  }

  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }

  const normalized = String(storagePath).replace(/\\/g, "/");
  const marker = "/storage/uploads/";
  const markerIndex = normalized.indexOf(marker);

  if (markerIndex >= 0) {
    return `${API_ORIGIN}${normalized.slice(markerIndex)}`;
  }

  const trimmed = normalized.replace(/^\.?\/?/, "");
  return `${API_ORIGIN}/${trimmed}`;
}

export default function ListingDetailPage() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDetail() {
    setLoading(true);
    setError("");

    try {
      const response = await listingsApi.getById(id);
      setListing(response.data || null);
    } catch (detailError) {
      setError(detailError.message || "Failed to load listing.");
      setListing(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [id]);

  return (
    <section className="stack-lg">
      <Link to="/browse" className="back-link">
        Back to listings
      </Link>

      {loading && <p className="muted">Loading Listing Details…</p>}
      {error && <Notice kind="error">{error}</Notice>}

      {!loading && listing && (
        <article className="detail-panel">
          <div className="detail-title-row">
            <div>
              <p className="eyebrow">Listing Detail</p>
              <h1>
                {[listing.year, listing.make, listing.model, listing.trim].filter(Boolean).join(" ") ||
                  "Untitled Listing"}
              </h1>
              <p className="detail-price">{toCurrency(listing.price)}</p>
            </div>
          </div>

          <div className="stack-sm">
            <h2>Vehicle Details</h2>
            <dl className="detail-grid detail-grid-specs">
              <div>
                <dt>Status</dt>
                <dd>{listing.status || "published"}</dd>
              </div>
              <div>
                <dt>Mileage</dt>
                <dd>{listing.mileage_km ? `${listing.mileage_km} km` : "N/A"}</dd>
              </div>
              <div>
                <dt>Body Type</dt>
                <dd>{listing.body_type || "N/A"}</dd>
              </div>
              <div>
                <dt>Color</dt>
                <dd>{listing.color || "N/A"}</dd>
              </div>
              <div>
                <dt>VIN</dt>
                <dd>{listing.vin || "N/A"}</dd>
              </div>
            </dl>
          </div>

          <div className="stack-sm">
            <h2>Contact Information</h2>
            <dl className="detail-grid detail-grid-contact">
              <div>
                <dt>Contact Email</dt>
                <dd>{listing.contact_email || "N/A"}</dd>
              </div>
              <div>
                <dt>Contact Phone</dt>
                <dd>{listing.contact_phone || "N/A"}</dd>
              </div>
            </dl>
          </div>

          {listing.description && (
            <div className="stack-sm">
              <h2>Description</h2>
              <p>{listing.description}</p>
            </div>
          )}

          <div className="stack-sm">
            <h2>Images</h2>
            {Array.isArray(listing.images) && listing.images.length > 0 ? (
              <div className="image-grid">
                {listing.images.map((image) => (
                  <figure key={image.id} className="image-card">
                    <img
                      src={imageHref(image.storage_path)}
                      alt="Listing"
                      width="800"
                      height="520"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </figure>
                ))}
              </div>
            ) : (
              <Notice kind="info">No images uploaded for this listing yet.</Notice>
            )}
          </div>
        </article>
      )}
    </section>
  );
}
