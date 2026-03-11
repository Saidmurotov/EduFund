import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { user, loginWithEmail, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Agar user allaqachon login qilgan bo'lsa (email yoki Google redirect)
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

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
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // signInWithRedirect: sahifa Google ga yo'naltiriladi, qaytganda
      // useEffect user ni sezib /dashboard ga o'tadi
    } catch (err) {
      console.error(err);
      const code = err?.code || "";
      if (code === "auth/popup-blocked") {
        setError("Popup bloklandi. Brauzer sozlamalarini tekshiring.");
      } else if (code === "auth/unauthorized-domain") {
        setError("Firebase Console → Auth → Authorized domains ga 'localhost' qo'shing.");
      } else {
        setError("Google bilan kirishda xato: " + (err?.message || code));
      }
      setGoogleLoading(false);
    }
  };

  const inputClass =
    "w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F9FAFB] border-2 border-[#E5E7EB] text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3D3DC4] focus:ring-2 focus:ring-[#3D3DC4]/20 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4">
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-[20px] shadow-xl shadow-black/5 border border-[#E5E7EB] p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#3D3DC4] to-[#6366F1] bg-clip-text text-transparent">
              EduFund AI
            </h1>
            <h2 className="text-xl font-bold text-[#1A1A2E] mt-3">
              Xush kelibsiz 👋
            </h2>
            <p className="text-sm text-[#9CA3AF] mt-1">Hisobingizga kiring</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="email"
                className={inputClass}
                placeholder="Email manzilingiz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type={showPw ? "text" : "password"}
                className={[inputClass, "pr-12"].join(" ")}
                placeholder="Parolingiz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                aria-label="Toggle password"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs text-[#3D3DC4] font-medium hover:underline">
                Parolni unutdingizmi?
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#3D3DC4] text-white text-sm font-semibold hover:bg-[#3232a8] disabled:opacity-60 transition-all shadow-lg shadow-[#3D3DC4]/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Yuklanmoqda...
                </span>
              ) : (
                "Kirish"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-xs text-[#9CA3AF] font-medium">yoki</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading || googleLoading}
              className="w-full py-3.5 rounded-xl bg-white border-2 border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] disabled:opacity-60 transition-all flex items-center justify-center gap-3"
            >
              {googleLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-[#3D3DC4]/30 border-t-[#3D3DC4] animate-spin" />
                  Google ga yo'naltirilmoqda...
                </span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google bilan kirish
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-sm text-[#9CA3AF] hover:text-[#374151] transition-colors"
            >
              Hisobingiz yo'qmi?{" "}
              <span className="text-[#3D3DC4] font-semibold">Ro'yxatdan o'ting</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
