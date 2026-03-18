import { useEffect, useState } from "react";

import Notice from "../components/Notice";
import { useAuth } from "../context/AuthContext";

const initialPreference = {
  make: "",
  model: "",
  year_min: "",
  year_max: "",
  price_max_cad: "",
  mileage_max_km: "",
  color: "",
  is_active: true,
};

const numericFields = new Set(["year_min", "year_max", "price_max_cad", "mileage_max_km"]);

function toPayload(form) {
  const payload = {};

  Object.entries(form).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) {
      return;
    }

    if (numericFields.has(key)) {
      payload[key] = Number(value);
    } else {
      payload[key] = value;
    }
  });

  return payload;
}

export default function BuyerPreferencesPage() {
  const { requestWithAuth } = useAuth();

  const [preferences, setPreferences] = useState([]);
  const [form, setForm] = useState(initialPreference);
  const [editingId, setEditingId] = useState("");
  const [editingForm, setEditingForm] = useState(initialPreference);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [notImplemented, setNotImplemented] = useState(false);

  async function loadPreferences() {
    setLoading(true);
    setError("");

    try {
      const response = await requestWithAuth("/preferences");
      setNotImplemented(false);
      setPreferences(Array.isArray(response.data) ? response.data : []);
    } catch (loadError) {
      if (loadError.status === 501) {
        setNotImplemented(true);
      } else {
        setError(loadError.message || "Failed to load preferences.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPreferences();
  }, []);

  async function createPreference(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await requestWithAuth("/preferences", {
        method: "POST",
        body: toPayload(form),
      });
      setForm(initialPreference);
      setMessage("Preference created.");
      await loadPreferences();
    } catch (createError) {
      if (createError.status === 501) {
        setNotImplemented(true);
      } else {
        setError(createError.message || "Failed to create preference.");
      }
    } finally {
      setBusy(false);
    }
  }

  function startEdit(preference) {
    setEditingId(preference.id);
    setEditingForm({
      make: preference.make || "",
      model: preference.model || "",
      year_min: preference.year_min ?? "",
      year_max: preference.year_max ?? "",
      price_max_cad: preference.price_max_cad ?? "",
      mileage_max_km: preference.mileage_max_km ?? "",
      color: preference.color || "",
      is_active: preference.is_active ?? true,
    });
  }

  async function saveEdit(id) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await requestWithAuth(`/preferences/${id}`, {
        method: "PATCH",
        body: toPayload(editingForm),
      });
      setMessage("Preference updated.");
      setEditingId("");
      await loadPreferences();
    } catch (updateError) {
      if (updateError.status === 501) {
        setNotImplemented(true);
      } else {
        setError(updateError.message || "Failed to update preference.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function deletePreference(id) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await requestWithAuth(`/preferences/${id}`, { method: "DELETE" });
      setMessage("Preference deleted.");
      await loadPreferences();
    } catch (deleteError) {
      if (deleteError.status === 501) {
        setNotImplemented(true);
      } else {
        setError(deleteError.message || "Failed to delete preference.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="stack-lg">
      <article className="hero-panel">
        <p className="eyebrow">Buyer Preferences</p>
        <h1>Capture your ideal vehicle profile for future notification matching.</h1>
        <p>
          This page is fully wired to the planned preference APIs. If backend routes return 501, you will see a
          readiness notice below.
        </p>
      </article>

      {message && <Notice kind="success">{message}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {notImplemented && (
        <Notice kind="warning">
          Preferences endpoints are currently not implemented in backend and return 501.
        </Notice>
      )}

      <form className="panel stack-md" onSubmit={createPreference}>
        <h2>Create Preference</h2>
        <div className="form-grid">
          <label>
            make
            <input
              type="text"
              value={form.make}
              onChange={(event) => setForm((current) => ({ ...current, make: event.target.value }))}
            />
          </label>
          <label>
            model
            <input
              type="text"
              value={form.model}
              onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
            />
          </label>
          <label>
            year min
            <input
              type="number"
              min="0"
              value={form.year_min}
              onChange={(event) => setForm((current) => ({ ...current, year_min: event.target.value }))}
            />
          </label>
          <label>
            year max
            <input
              type="number"
              min="0"
              value={form.year_max}
              onChange={(event) => setForm((current) => ({ ...current, year_max: event.target.value }))}
            />
          </label>
          <label>
            max price (CAD)
            <input
              type="number"
              min="0"
              value={form.price_max_cad}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  price_max_cad: event.target.value,
                }))
              }
            />
          </label>
          <label>
            max mileage (km)
            <input
              type="number"
              min="0"
              value={form.mileage_max_km}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  mileage_max_km: event.target.value,
                }))
              }
            />
          </label>
          <label>
            color
            <input
              type="text"
              value={form.color}
              onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
            />
          </label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_active: event.target.checked,
                }))
              }
            />
            active
          </label>
        </div>

        <button className="button" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save Preference"}
        </button>
      </form>

      <article className="panel stack-md">
        <div className="section-head">
          <h2>My Preferences</h2>
          <button className="button button-subtle" type="button" onClick={loadPreferences}>
            Reload
          </button>
        </div>

        {loading && <p className="muted">Loading Preferences…</p>}
        {!loading && preferences.length === 0 && !notImplemented && (
          <Notice kind="info">No preferences saved yet.</Notice>
        )}

        <div className="preferences-grid">
          {preferences.map((preference) => {
            const isEditing = editingId === preference.id;

            return (
              <article key={preference.id} className="panel stack-sm">
                <p className="listing-id">#{String(preference.id).slice(0, 8)}</p>
                <p>
                  {[preference.make, preference.model].filter(Boolean).join(" ") || "Any make/model"}
                </p>
                <p className="muted">
                  Year {preference.year_min ?? "any"} - {preference.year_max ?? "any"} | Price {"<="}{" "}
                  {preference.price_max_cad ?? "any"}
                </p>

                <div className="row-actions">
                  <button className="button button-subtle" type="button" onClick={() => startEdit(preference)}>
                    Edit
                  </button>
                  <button
                    className="button button-danger"
                    type="button"
                    onClick={() => deletePreference(preference.id)}
                  >
                    Delete
                  </button>
                </div>

                {isEditing && (
                  <div className="form-grid">
                    <label>
                      make
                      <input
                        type="text"
                        value={editingForm.make}
                        onChange={(event) =>
                          setEditingForm((current) => ({ ...current, make: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      model
                      <input
                        type="text"
                        value={editingForm.model}
                        onChange={(event) =>
                          setEditingForm((current) => ({ ...current, model: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      year min
                      <input
                        type="number"
                        value={editingForm.year_min}
                        onChange={(event) =>
                          setEditingForm((current) => ({ ...current, year_min: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      year max
                      <input
                        type="number"
                        value={editingForm.year_max}
                        onChange={(event) =>
                          setEditingForm((current) => ({ ...current, year_max: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      price max
                      <input
                        type="number"
                        value={editingForm.price_max_cad}
                        onChange={(event) =>
                          setEditingForm((current) => ({
                            ...current,
                            price_max_cad: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      mileage max
                      <input
                        type="number"
                        value={editingForm.mileage_max_km}
                        onChange={(event) =>
                          setEditingForm((current) => ({
                            ...current,
                            mileage_max_km: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      color
                      <input
                        type="text"
                        value={editingForm.color}
                        onChange={(event) =>
                          setEditingForm((current) => ({ ...current, color: event.target.value }))
                        }
                      />
                    </label>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={editingForm.is_active}
                        onChange={(event) =>
                          setEditingForm((current) => ({
                            ...current,
                            is_active: event.target.checked,
                          }))
                        }
                      />
                      active
                    </label>
                  </div>
                )}

                {isEditing && (
                  <button
                    className="button"
                    type="button"
                    onClick={() => saveEdit(preference.id)}
                    disabled={busy}
                  >
                    Save Changes
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}
