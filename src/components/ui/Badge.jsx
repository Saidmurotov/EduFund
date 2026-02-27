export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "bg-slate-800 text-slate-100",
    blue: "bg-[#2563EB]/20 text-blue-300 border border-[#2563EB]/40",
    green: "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40",
    outline: "border border-slate-600 text-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

