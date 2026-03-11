import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function Register() {
  const { user, registerWithEmail, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Agar user allaqachon login bo'lsa (Google redirect qaytganda)
  useEffect(() => {
    if (user) {
      navigate("/onboarding", { replace: true });
    }
  }, [user, navigate]);

  // Parol kuchliligi logikasi
  const getPwStrength = (pw) => {
    if (!pw) return { label: "", color: "bg-gray-200", width: "0%" };
    if (pw.length < 6) return { label: "Zaif", color: "bg-red-500", width: "33%" };
    if (pw.length < 10) return { label: "O'rta", color: "bg-yellow-500", width: "66%" };
    return { label: "Kuchli", color: "bg-green-500", width: "100%" };
  };

  const strength = getPwStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      return setError("Hamma maydonlarni to'ldiring.");
    }
    if (password !== confirmPassword) {
      return setError("Parollar mos kelmadi.");
    }
    if (password.length < 6) {
      return setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
      toast?.showToast?.("Hisob muvaffaqiyatli yaratildi!", "success");
      navigate("/onboarding");
    } catch (err) {
      console.error(err);
      setError("Xatolik yuz berdi. Email band bo'lishi mumkin.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // signInWithRedirect: sahifa Google ga yo'naltiriladi
      // Qaytganda useEffect user ni sezib /onboarding ga o'tadi
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
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4 py-8">
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-[20px] shadow-xl shadow-black/5 border border-[#E5E7EB] p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#3D3DC4] to-[#6366F1] bg-clip-text text-transparent">
              EduFund AI
            </h1>
            <h2 className="text-xl font-bold text-[#1A1A2E] mt-3">
              Hisob yarating
            </h2>
            <p className="text-sm text-[#9CA3AF] mt-1">Bepul ro'yxatdan o'ting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                className={inputClass}
                placeholder="To'liq ism"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength indicator */}
            {password && (
              <div className="px-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                    Parol: {strength.label}
                  </span>
                </div>
                <div className="h-1 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className={[strength.color, "h-full transition-all duration-300"].join(" ")}
                    style={{ width: strength.width }}
                  />
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type={showPw ? "text" : "password"}
                className={inputClass}
                placeholder="Parolni tasdiqlang"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#3D3DC4] text-white text-sm font-semibold hover:bg-[#3232a8] disabled:opacity-60 transition-all shadow-lg shadow-[#3D3DC4]/25"
            >
              {loading ? "Hisob yaratilmoqda..." : "Ro'yxatdan o'tish"}
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
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-white border-2 border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] disabled:opacity-60 transition-all flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google bilan ro'yxatdan o'tish
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-[#9CA3AF] hover:text-[#374151] transition-colors"
            >
              Allaqachon hisobingiz bormi?{" "}
              <span className="text-[#3D3DC4] font-semibold">Kiring</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
