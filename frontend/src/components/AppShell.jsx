import { NavLink, useNavigate } from "react-router-dom";

import logo from "../asset/logo.png";
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
          <img className="brand-logo" src={logo} alt="OpenMotor logo" />
          <div>
            <p className="brand-kicker">Team 26</p>
            <NavLink to="/browse" className="brand-link">
              OpenMotor
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
              <span className="nav-user">{user?.display_name || "Signed-in user"}</span>
            </>
          )}
        </nav>
      </header>

      <main className="page-shell" id="main-content">
        {children}
      </main>
    </div>
  );
}
