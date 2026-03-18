import { useEffect, useState } from "react";

import ListingCard from "../components/ListingCard";
import Notice from "../components/Notice";
import { useAuth } from "../context/AuthContext";

const numericFields = new Set(["year", "mileage_km", "price"]);

const initialListingForm = {
  make: "",
  model: "",
  trim: "",
  year: "",
  vin: "",
  body_type: "",
  color: "",
  mileage_km: "",
  price: "",
  description: "",
  contact_email: "",
  contact_phone: "",
};

function buildPayload(form) {
  const payload = {};

  Object.entries(form).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) {
      return;
    }

    payload[key] = numericFields.has(key) ? Number(value) : value;
  });

  return payload;
}

function mapListingToEditForm(listing) {
  const next = { ...initialListingForm };
  Object.keys(next).forEach((key) => {
    const value = listing[key];
    next[key] = value === null || value === undefined ? "" : String(value);
  });
  return next;
}

export default function SellerDashboardPage() {
  const { requestWithAuth } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [createForm, setCreateForm] = useState(initialListingForm);
  const [createImages, setCreateImages] = useState(null);
  const [createImageInputKey, setCreateImageInputKey] = useState(0);
  const [editListingId, setEditListingId] = useState("");
  const [editForm, setEditForm] = useState(initialListingForm);

  async function loadMyListings() {
    setLoading(true);
    setError("");

    try {
      const response = await requestWithAuth("/my/listings");
      setListings(Array.isArray(response.data) ? response.data : []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyListings();
  }, []);

  async function createListing(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const createResponse = await requestWithAuth("/listings", {
        method: "POST",
        body: buildPayload(createForm),
      });

      const createdListingId = createResponse?.data?.id;
      let uploadFailedMessage = "";

      if (createdListingId && createImages && createImages.length > 0) {
        const formData = new FormData();
        Array.from(createImages).forEach((file) => {
          formData.append("images", file);
        });

        try {
          await requestWithAuth(`/listings/${createdListingId}/images`, {
            method: "POST",
            body: formData,
            isFormData: true,
          });
          setMessage("Listing created and images uploaded.");
        } catch (uploadError) {
          uploadFailedMessage = uploadError.message || "Image upload failed.";
          setMessage("Listing created as draft.");
        }
      } else {
        setMessage("Listing created as draft.");
      }

      setCreateForm(initialListingForm);
      setCreateImages(null);
      setCreateImageInputKey((current) => current + 1);
      await loadMyListings();

      if (uploadFailedMessage) {
        setError(`Listing was created, but image upload failed: ${uploadFailedMessage}`);
      }
    } catch (createError) {
      setError(createError.message || "Failed to create listing.");
    } finally {
      setBusy(false);
    }
  }

  function startEditing(listing) {
    setEditListingId(listing.id);
    setEditForm(mapListingToEditForm(listing));
  }

  async function saveEdit(listingId) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await requestWithAuth(`/listings/${listingId}`, {
        method: "PATCH",
        body: buildPayload(editForm),
      });
      setMessage("Listing updated.");
      setEditListingId("");
      await loadMyListings();
    } catch (updateError) {
      setError(updateError.message || "Failed to update listing.");
    } finally {
      setBusy(false);
    }
  }

  async function runListingAction(listingId, action) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (action === "publish") {
        await requestWithAuth(`/listings/${listingId}/publish`, { method: "POST" });
        setMessage("Listing publish requested.");
      } else if (action === "unpublish") {
        await requestWithAuth(`/listings/${listingId}/unpublish`, { method: "POST" });
        setMessage("Listing moved back to draft.");
      } else {
        await requestWithAuth(`/listings/${listingId}`, { method: "DELETE" });
        setMessage("Listing removed.");
      }

      await loadMyListings();
    } catch (actionError) {
      setError(actionError.message || `Action '${action}' failed.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="stack-lg">
      <article className="hero-panel">
        <p className="eyebrow">Seller Hub</p>
        <h1>Manage your listing lifecycle from draft to published.</h1>
      </article>

      {message && <Notice kind="success">{message}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      <form className="panel stack-md" onSubmit={createListing}>
        <h2>Create Listing</h2>
        <div className="form-grid form-grid-single">
          {Object.entries(createForm).map(([field, value]) => {
            const isRequired = ["make", "model", "year", "price"].includes(field);
            const label = field.replaceAll("_", " ");
            const inputType = numericFields.has(field) ? "number" : "text";

            if (field === "description") {
              return (
                <label className="form-span-2" key={field}>
                  {label}
                  <textarea
                    rows="3"
                    required={isRequired}
                    value={value}
                    onChange={(event) =>
                      setCreateForm((current) => ({ ...current, [field]: event.target.value }))
                    }
                  />
                </label>
              );
            }

            return (
              <label key={field}>
                {label}
                <input
                  type={inputType}
                  min={inputType === "number" ? "0" : undefined}
                  required={isRequired}
                  value={value}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, [field]: event.target.value }))
                  }
                />
              </label>
            );
          })}
          <label>
            Upload Images (optional)
            <input
              key={createImageInputKey}
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => setCreateImages(event.target.files)}
            />
            {createImages && createImages.length > 0 ? (
              <small className="muted">{createImages.length} file(s) selected</small>
            ) : null}
          </label>
        </div>

        <button className="button" disabled={busy} type="submit">
          {busy ? "Saving…" : "Create Draft"}
        </button>
      </form>

      <article className="stack-md">
        <div className="section-head">
          <h2>My Listings</h2>
          <button className="button button-subtle" type="button" onClick={loadMyListings}>
            Reload
          </button>
        </div>

        {loading && <p className="muted">Loading Your Listings…</p>}
        {!loading && listings.length === 0 && (
          <Notice kind="info">No listings yet. Create your first draft above.</Notice>
        )}

        <div className="listing-grid">
          {listings.map((listing) => {
            const actions = [
              {
                label: "Publish",
                onClick: () => runListingAction(listing.id, "publish"),
                disabled: listing.status === "published" || busy,
              },
              {
                label: "Unpublish",
                onClick: () => runListingAction(listing.id, "unpublish"),
                disabled: listing.status !== "published" || busy,
              },
              {
                label: "Remove",
                variant: "danger",
                onClick: () => runListingAction(listing.id, "remove"),
                disabled: listing.status === "removed" || busy,
              },
            ];

            const isEditing = editListingId === listing.id;

            return (
              <article key={listing.id} className="stack-sm">
                <ListingCard listing={listing} actions={actions} compact />

                <div className="panel stack-sm">
                  <div className="row-actions">
                    <button className="button button-subtle" type="button" onClick={() => startEditing(listing)}>
                      Edit Fields
                    </button>

                    {isEditing && (
                      <button
                        className="button"
                        type="button"
                        onClick={() => saveEdit(listing.id)}
                        disabled={busy}
                      >
                        Save Edit
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <div className="form-grid form-grid-single">
                      {Object.entries(editForm).map(([field, value]) => {
                        const label = field.replaceAll("_", " ");
                        const inputType = numericFields.has(field) ? "number" : "text";

                        if (field === "description") {
                          return (
                            <label className="form-span-2" key={field}>
                              {label}
                              <textarea
                                rows="3"
                                value={value}
                                onChange={(event) =>
                                  setEditForm((current) => ({ ...current, [field]: event.target.value }))
                                }
                              />
                            </label>
                          );
                        }

                        return (
                          <label key={field}>
                            {label}
                            <input
                              type={inputType}
                              min={inputType === "number" ? "0" : undefined}
                              value={value}
                              onChange={(event) =>
                                setEditForm((current) => ({ ...current, [field]: event.target.value }))
                              }
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}
