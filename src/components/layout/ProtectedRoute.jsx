import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] text-slate-100 gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-[#334155] border-t-[#3D3DC4] animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Biroz kuting...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
