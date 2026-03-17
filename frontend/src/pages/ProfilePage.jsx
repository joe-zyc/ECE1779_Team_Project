import { useState } from "react";

import Notice from "../components/Notice";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, accessToken, refreshToken, refresh, requestWithAuth, setSession } = useAuth();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function reloadProfile() {
    setBusy(true);
    setMessage("");
    setError("");

    try {
      const response = await requestWithAuth("/auth/me");
      setSession({ user: response.data });
      setMessage("Profile refreshed from backend.");
    } catch (reloadError) {
      setError(reloadError.message || "Could not refresh profile.");
    } finally {
      setBusy(false);
    }
  }

  async function rotateAccessToken() {
    setBusy(true);
    setMessage("");
    setError("");

    try {
      await refresh();
      setMessage("Access token refreshed.");
    } catch (refreshError) {
      setError(refreshError.message || "Refresh failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="stack-lg">
      <article className="panel stack-md">
        <p className="eyebrow">My Account</p>
        <h1>{user?.display_name || "User"}</h1>

        {message && <Notice kind="success">{message}</Notice>}
        {error && <Notice kind="error">{error}</Notice>}

        <dl className="profile-grid">
          <div>
            <dt>Email</dt>
            <dd>{user?.email || "N/A"}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user?.role || "N/A"}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{user?.phone || "N/A"}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd>{user?.id || "N/A"}</dd>
          </div>
          <div>
            <dt>Access Token</dt>
            <dd>{accessToken ? "Loaded" : "Missing"}</dd>
          </div>
          <div>
            <dt>Refresh Token</dt>
            <dd>{refreshToken ? "Loaded" : "Missing"}</dd>
          </div>
        </dl>

        <div className="row-actions">
          <button className="button" disabled={busy} onClick={reloadProfile}>
            Reload Profile
          </button>
          <button className="button button-subtle" disabled={busy} onClick={rotateAccessToken}>
            Refresh Access Token
          </button>
        </div>
      </article>
    </section>
  );
}
