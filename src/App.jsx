import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import BottomNav from "./components/layout/BottomNav.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";

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

export default function App() {
  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16 px-4 max-w-3xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <GrantCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/premium"
            element={
              <ProtectedRoute>
                <Premium />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute adminOnly>
                <AdminStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grants/:id"
            element={
              <ProtectedRoute>
                <GrantDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <Roadmap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Saved />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

