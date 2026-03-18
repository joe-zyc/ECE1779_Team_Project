import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <section className="stack-lg">
      <article className="panel stack-md">
        <p className="eyebrow">My Account</p>
        <h1>{user?.display_name || "User"}</h1>

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
        </dl>
      </article>
    </section>
  );
}
