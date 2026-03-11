import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Search from "./pages/Search.jsx";
import Chat from "./pages/Chat.jsx";
import GrantDetail from "./pages/GrantDetail.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Saved from "./pages/Saved.jsx";
import Profile from "./pages/Profile.jsx";
import GrantCalendar from "./pages/GrantCalendar.jsx";
import AdminStats from "./pages/AdminStats.jsx";
import Premium from "./pages/Premium.jsx";

/* Helper: wrap a page inside ProtectedRoute + AppLayout */
function AppPage({ children, adminOnly = false }) {
  return (
    <ProtectedRoute adminOnly={adminOnly}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Public (no sidebar, no bottom nav) ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* ── App pages (sidebar on desktop, bottom nav on mobile) ── */}
      <Route path="/dashboard" element={<AppPage><Dashboard /></AppPage>} />
      <Route path="/search" element={<AppPage><Search /></AppPage>} />
      <Route path="/chat" element={<AppPage><Chat /></AppPage>} />
      <Route path="/grants/:id" element={<AppPage><GrantDetail /></AppPage>} />
      <Route path="/roadmap" element={<AppPage><Roadmap /></AppPage>} />
      <Route path="/saved" element={<AppPage><Saved /></AppPage>} />
      <Route path="/calendar" element={<AppPage><GrantCalendar /></AppPage>} />
      <Route path="/profile" element={<AppPage><Profile /></AppPage>} />
      <Route path="/premium" element={<AppPage><Premium /></AppPage>} />

      {/* ── Admin ── */}
      <Route
        path="/admin/stats"
        element={<AppPage adminOnly><AdminStats /></AppPage>}
      />

      {/* ── Redirects ── */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
