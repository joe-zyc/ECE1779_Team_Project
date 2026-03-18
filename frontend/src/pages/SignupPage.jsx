import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Notice from "../components/Notice";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  email: "",
  password: "",
  role: "buyer",
  display_name: "",
  phone: "",
};

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const redirectTo = location.state?.redirectTo || "";

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await signup(form);
      navigate("/login", {
        state: {
          signupMessage: "Account created. Please sign in.",
          redirectTo,
        },
      });
    } catch (submitError) {
      setError(submitError.message || "Signup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-grid">
      <article className="auth-side">
        <p className="eyebrow">Onboarding</p>
        <h1>Build your buyer or seller identity in one step.</h1>
        <p>
          Choose a role now. The frontend enforces role-appropriate tools, and backend RBAC protects routes.
        </p>
      </article>

      <form className="panel stack-md" onSubmit={onSubmit}>
        <h2>Create Account</h2>

        {error && <Notice kind="error">{error}</Notice>}

        <label>
          Display Name
          <input
            name="display_name"
            type="text"
            required
            autoComplete="name"
            value={form.display_name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                display_name: event.target.value,
              }))
            }
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength="6"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </label>

        <label>
          Role
          <select
            name="role"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </label>

        <label>
          Phone (optional)
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="e.g., 416-555-0100…"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </label>

        <button className="button" type="submit" disabled={busy}>
          {busy ? "Creating Account…" : "Create Account"}
        </button>

        <p className="muted">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}
