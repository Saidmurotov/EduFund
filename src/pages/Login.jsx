import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Login() {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast?.showToast?.("Xush kelibsiz!", "success");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Email yoki parol noto'g'ri.");
      toast?.showToast?.("Email yoki parol noto'g'ri", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      toast?.showToast?.("Xush kelibsiz!", "success");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google bilan kirishda xato yuz berdi.");
      toast?.showToast?.("Internet bilan muammo", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0F172A]">
      <Card className="w-full max-w-md bg-[#1E293B]/80 border-slate-700 shadow-2xl shadow-black/40">
        <h1 className="text-2xl font-semibold mb-2 text-slate-50">
          EduFund AI
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Grant va stipendiya topish uchun AI platforma.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-200">Email</label>
            <input
              type="email"
              className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Parol</label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-[#EF4444] bg-[#1F2933] border border-[#EF4444]/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Login"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            Google bilan kirish
          </Button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full text-sm text-slate-400 hover:text-slate-200 mt-2"
          >
            Hisobingiz yo‘qmi? Ro‘yxatdan o‘ting
          </button>
        </form>
      </Card>
    </div>
  );
}

