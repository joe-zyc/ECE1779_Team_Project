import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function navClassName({ isActive }) {
  return isActive ? "nav-link nav-link-active" : "nav-link";
}

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const { isAuthenticated, role, user, logout } = useAuth();

  async function onLogout() {
    await logout();
    navigate("/browse");
  }

  return (
    <div className="app-frame">
      <a href="#main-content" className="skip-link">
        Skip to Main Content
      </a>

      <header className="topbar">
        <div className="brand-wrap">
          <span className="brand-dot" />
          <div>
            <p className="brand-kicker">ECE1779 Team 26</p>
            <NavLink to="/browse" className="brand-link">
              Used Car Atlas
            </NavLink>
          </div>
        </div>

        <nav className="main-nav">
          <NavLink to="/browse" className={navClassName}>
            Browse
          </NavLink>

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={navClassName}>
                Login
              </NavLink>
              <NavLink to="/signup" className={navClassName}>
                Sign Up
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <>
              {role === "seller" && (
                <NavLink to="/seller" className={navClassName}>
                  Seller Hub
                </NavLink>
              )}

              {role === "buyer" && (
                <NavLink to="/preferences" className={navClassName}>
                  Preferences
                </NavLink>
              )}

              <NavLink to="/me" className={navClassName}>
                Profile
              </NavLink>
              <button className="ghost-button" type="button" onClick={onLogout}>
                Log Out
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="page-shell" id="main-content">
        {isAuthenticated && (
          <aside className="session-pill">
            <p className="session-name">{user?.display_name || "Signed-in user"}</p>
            <p className="session-meta">Role: {role}</p>
          </aside>
        )}
        {children}
      </main>
    </div>
  );
}
