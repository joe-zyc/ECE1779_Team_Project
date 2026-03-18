import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listingsApi } from "../api/client";

function toMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function toImageUrl(storagePath) {
  if (!storagePath) {
    return "";
  }

  const normalized = String(storagePath).replace(/\\/g, "/");

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  const marker = "/storage/uploads/";
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex >= 0) {
    return `${import.meta.env.VITE_API_URL}${normalized.slice(markerIndex)}`;
  }

  return `${import.meta.env.VITE_API_URL}/${normalized.replace(/^\.?\/?/, "")}`;
}

export default function ListingCard({ listing, actions = [], compact = false }) {
  const title = [listing.year, listing.make, listing.model, listing.trim]
    .filter(Boolean)
    .join(" ");

  const seededPreviewPath =
    listing.preview_image_path ||
    listing.image_url ||
    (Array.isArray(listing.images) && listing.images[0] ? listing.images[0].storage_path : "");

  const [previewPath, setPreviewPath] = useState(seededPreviewPath || "");
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setPreviewPath(seededPreviewPath || "");
    setPreviewError(false);

    if (seededPreviewPath || !listing.id) {
      return () => {
        cancelled = true;
      };
    }

    async function fetchPreview() {
      try {
        const response = await listingsApi.getById(listing.id);
        const imagePath = response?.data?.images?.[0]?.storage_path || "";
        if (!cancelled) {
          setPreviewPath(imagePath);
        }
      } catch {
        // Silent fallback to placeholder when detail call fails.
      }
    }

    fetchPreview();

    return () => {
      cancelled = true;
    };
  }, [listing.id, seededPreviewPath]);

  const previewUrl = useMemo(() => toImageUrl(previewPath), [previewPath]);

  return (
    <article className={`listing-card ${compact ? "listing-card-compact" : ""}`}>
      <div className="listing-card-media">
        {previewUrl && !previewError ? (
          <img
            src={previewUrl}
            alt={title || "Car listing image"}
            onError={() => setPreviewError(true)}
          />
        ) : (
          <div className="listing-card-placeholder">No Photo</div>
        )}
      </div>

      <div className="listing-card-main">
        <div className="listing-head">
          <p className="listing-status">{listing.status || "published"}</p>
          <p className="listing-id">#{String(listing.id || "").slice(0, 8)}</p>
        </div>

        <h3>{title || "Untitled Listing"}</h3>
        <p className="listing-price">{toMoney(listing.price)}</p>

        <dl className="listing-meta">
          <div>
            <dt>Mileage</dt>
            <dd>{listing.mileage_km ? `${listing.mileage_km} km` : "N/A"}</dd>
          </div>
          <div>
            <dt>Color</dt>
            <dd>{listing.color || "N/A"}</dd>
          </div>
          <div>
            <dt>Body</dt>
            <dd>{listing.body_type || "N/A"}</dd>
          </div>
        </dl>

        {listing.description && <p className="listing-description">{listing.description}</p>}

        <div className="row-actions">
          <Link className="button button-subtle" to={`/listings/${listing.id}`}>
            View Details
          </Link>

          {actions.map((action) => (
            <button
              key={action.label}
              className={action.variant === "danger" ? "button button-danger" : "button button-subtle"}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
