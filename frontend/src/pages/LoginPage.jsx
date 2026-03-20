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
        <h1>Welcome back to OpenMotor.</h1>
        <p className="auth-side-intro">
          Sign in to continue your marketplace journey with faster access to the tools that match your role.
        </p>
        <div className="auth-side-highlights">
          <p>Manage your listings and updates in one dashboard.</p>
          <p>Track buyer and seller activity with clear details.</p>
          <p>Jump right back into searching or selling.</p>
        </div>
      </article>

      <form className="panel stack-md" onSubmit={onSubmit}>
        <div className="form-header">
          <h2>Login</h2>
          <p className="form-subtitle">Welcome back</p>
        </div>

        {signupMessage && <Notice kind="success">{signupMessage}</Notice>}
        {error && <Notice kind="error">{error}</Notice>}

        <fieldset className="form-group">
          <label htmlFor="email">
            <span className="label-text">Email</span>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>

          <label htmlFor="password">
            <span className="label-text">Password</span>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </label>
        </fieldset>

        <button className="button button-primary" type="submit" disabled={busy}>
          {busy ? "Signing In…" : "Sign In"}
        </button>

        <hr className="divider" />

        <p className="form-footer">
          Need an account? <Link to="/signup" className="link-primary">Create one</Link>
        </p>
      </form>
    </section>
  );
}
