import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

export default function Register() {
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lishi kerak.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Parollar mos kelmadi.");
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
      navigate("/onboarding");
    } catch (err) {
      console.error(err);
      setError("Ro'yxatdan o'tishda xato yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/onboarding");
    } catch (err) {
      console.error(err);
      setError("Google bilan ro'yxatdan o'tishda xato yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0F172A]">
      <Card className="w-full max-w-md bg-[#1E293B]/80 border-slate-700 shadow-2xl shadow-black/40">
        <h1 className="text-2xl font-semibold mb-2 text-slate-50">
          Ro‘yxatdan o‘tish
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          EduFund AI hisobingizni yarating.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-200">To'liq ism</label>
            <input
              className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ism Familiya"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Email</label>
            <input
              type="email"
              className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Parol</label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kamida 6 belgidan iborat"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Parolni tasdiqlash</label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Parolni qayta kiriting"
            />
          </div>

          {error && (
            <p className="text-sm text-[#EF4444] bg-[#1F2933] border border-[#EF4444]/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Ro‘yxatdan o‘tish"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            Google bilan ro'yxatdan o'tish
          </Button>
        </form>
      </Card>
    </div>
  );
}

