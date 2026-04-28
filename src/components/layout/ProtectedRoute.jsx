import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0F172A] flex items-center justify-center z-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const hasPreferences =
    user.preferences && Object.keys(user.preferences).length > 0;
  const needsOnboarding = user.onboarded !== true && !hasPreferences;

  // Redirect to onboarding if not done, but don't loop if already on /onboarding
  if (needsOnboarding && window.location.pathname !== "/onboarding") {
     return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
