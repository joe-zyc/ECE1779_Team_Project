import { Link } from "react-router-dom";

export default function ListingAccessPromptPage({ redirectTo }) {
  const nextTarget = redirectTo || "/browse";

  return (
    <section className="stack-lg">
      <article className="panel stack-md">
        <p className="eyebrow">Sign-In Required</p>
        <h1>View listing details after signing in.</h1>
        <p>
          This page is only available for authenticated users. Sign in or create an account to continue.
        </p>

        <div className="row-actions">
          <Link className="button" to="/login" state={{ redirectTo: nextTarget }}>
            Sign In
          </Link>
          <Link className="button button-subtle" to="/signup" state={{ redirectTo: nextTarget }}>
            Sign Up
          </Link>
          <Link className="button button-subtle" to="/browse">
            Back to Browse
          </Link>
        </div>
      </article>
    </section>
  );
}
