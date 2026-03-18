import { Link } from "react-router-dom";

import logo from "../asset/logo.png";

export default function LandingPage() {
  return (
    <section className="landing-shell">
      <article className="landing-card">
        <img className="landing-logo" src={logo} alt="OpenMotor logo" />
        <h1>Welcome to OpenMotor</h1>
        <p>
          A better marketplace for buying and selling used cars.
        </p>
        <div className="landing-actions">
          <Link className="button" to="/login">
            Login
          </Link>
          <Link className="button button-subtle" to="/signup">
            Sign Up
          </Link>
        </div>
      </article>
    </section>
  );
}
