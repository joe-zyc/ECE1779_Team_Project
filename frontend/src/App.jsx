import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";
import Notice from "./components/Notice";
import { useAuth } from "./context/AuthContext";
import BuyerPreferencesPage from "./pages/BuyerPreferencesPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import PublicListingsPage from "./pages/PublicListingsPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import SignupPage from "./pages/SignupPage";

function ProtectedRoute({ roles, children }) {
  const { ready, isAuthenticated, role } = useAuth();

  if (!ready) {
    return <p className="muted">Checking session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(role)) {
    return (
      <section className="stack-lg">
        <Notice kind="warning">You do not have permission to access this section.</Notice>
      </section>
    );
  }

  return children;
}

function NotFoundPage() {
  return (
    <section className="stack-lg">
      <article className="panel stack-sm">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>That route does not exist in this frontend app.</p>
      </article>
    </section>
  );
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/browse" element={<PublicListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/seller"
          element={
            <ProtectedRoute roles={["seller"]}>
              <SellerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/preferences"
          element={
            <ProtectedRoute roles={["buyer"]}>
              <BuyerPreferencesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/me"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
