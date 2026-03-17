import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Notice from "../components/Notice";
import { listingsApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

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
    return `http://localhost:3001${normalized.slice(markerIndex)}`;
  }

  const trimmed = normalized.replace(/^\.?\/?/, "");
  return `http://localhost:3001/${trimmed}`;
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const { role, isAuthenticated, requestWithAuth } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

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

  async function handleReport() {
    setInfo("");
    setError("");

    try {
      await requestWithAuth(`/listings/${id}/report`, { method: "POST" });
      setInfo("Listing reported successfully.");
    } catch (reportError) {
      setError(reportError.message || "Could not submit report.");
    }
  }

  return (
    <section className="stack-lg">
      <Link to="/" className="back-link">
        Back to listings
      </Link>

      {loading && <p className="muted">Loading listing details...</p>}
      {error && <Notice kind="error">{error}</Notice>}
      {info && <Notice kind="success">{info}</Notice>}

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

            {isAuthenticated && role === "buyer" && (
              <button className="button button-danger" onClick={handleReport}>
                Report Listing
              </button>
            )}
          </div>

          <dl className="detail-grid">
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
            <div>
              <dt>Contact Email</dt>
              <dd>{listing.contact_email || "N/A"}</dd>
            </div>
            <div>
              <dt>Contact Phone</dt>
              <dd>{listing.contact_phone || "N/A"}</dd>
            </div>
          </dl>

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
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                    <figcaption>{image.storage_path}</figcaption>
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
