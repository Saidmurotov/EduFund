import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import BottomNav from "./components/layout/BottomNav.jsx";

// Pages
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Chat = lazy(() => import("./pages/Chat.jsx"));
const GrantDetail = lazy(() => import("./pages/GrantDetail.jsx"));
const Roadmap = lazy(() => import("./pages/Roadmap.jsx"));
const Saved = lazy(() => import("./pages/Saved.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const GrantCalendar = lazy(() => import("./pages/GrantCalendar.jsx"));
const AdminStats = lazy(() => import("./pages/AdminStats.jsx"));
const Premium = lazy(() => import("./pages/Premium.jsx"));

const PageFallback = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
  </div>
);

const PublicLayout = ({ children }) => {
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">{children}</div>;
};

const PrivateLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>

        {/* BottomNav for mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
      {/* ── Public (no sidebar, no bottom nav) ── */}
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <Onboarding />
            </PublicLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Private App pages (sidebar on desktop, bottom nav on mobile) ── */}
      <Route path="/dashboard" element={<ProtectedRoute><PrivateLayout><Dashboard /></PrivateLayout></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><PrivateLayout><Search /></PrivateLayout></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><PrivateLayout><Chat /></PrivateLayout></ProtectedRoute>} />
      <Route path="/grants/:id" element={<ProtectedRoute><PrivateLayout><GrantDetail /></PrivateLayout></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute><PrivateLayout><Roadmap /></PrivateLayout></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><PrivateLayout><Saved /></PrivateLayout></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><PrivateLayout><GrantCalendar /></PrivateLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><PrivateLayout><Profile /></PrivateLayout></ProtectedRoute>} />
      <Route path="/premium" element={<ProtectedRoute><PrivateLayout><Premium /></PrivateLayout></ProtectedRoute>} />

      {/* ── Admin ── */}
      <Route
        path="/admin/stats"
        element={
          <ProtectedRoute adminOnly>
            <PrivateLayout>
              <AdminStats />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Redirects ── */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
