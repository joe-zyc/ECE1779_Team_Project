import { Link } from "react-router-dom";

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

export default function ListingCard({ listing, actions = [], compact = false }) {
  const title = [listing.year, listing.make, listing.model, listing.trim]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={`listing-card ${compact ? "listing-card-compact" : ""}`}>
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
    </article>
  );
}
