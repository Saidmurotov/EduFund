import { useAuth as useAuthInner } from "../context/AuthContext.jsx";

export function useAuth() {
  return useAuthInner();
}

