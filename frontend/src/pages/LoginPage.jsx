import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Notice from "../components/Notice";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const signupMessage = location.state?.signupMessage || "";
  const redirectTo = location.state?.redirectTo || "";

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const user = await login(form);
      if (redirectTo) {
        navigate(redirectTo);
      } else if (user?.role === "seller") {
        navigate("/seller");
      } else if (user?.role === "buyer") {
        navigate("/preferences");
      } else {
        navigate("/");
      }
    } catch (submitError) {
      setError(submitError.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-grid">
      <article className="auth-side">
        <p className="eyebrow">Secure Access</p>
        <h1>Sign in to unlock your role-specific workspace.</h1>
        <p>
          Sellers manage inventory lifecycle and buyers manage matching preferences with alert-ready filters.
        </p>
      </article>

      <form className="panel stack-md" onSubmit={onSubmit}>
        <h2>Login</h2>

        {signupMessage && <Notice kind="success">{signupMessage}</Notice>}
        {error && <Notice kind="error">{error}</Notice>}

        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </label>

        <button className="button" type="submit" disabled={busy}>
          {busy ? "Signing in..." : "Sign In"}
        </button>

        <p className="muted">
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </section>
  );
}
