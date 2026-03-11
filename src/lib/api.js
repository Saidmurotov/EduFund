import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export async function withAuth(getIdToken) {
  const token = getIdToken ? await getIdToken() : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

