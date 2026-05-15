export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100",
    blue: "bg-[#2563EB]/10 text-blue-700 border border-[#2563EB]/30 dark:bg-[#2563EB]/20 dark:text-blue-300 dark:border-[#2563EB]/40",
    green: "bg-emerald-600/10 text-emerald-700 border border-emerald-500/30 dark:bg-emerald-600/20 dark:text-emerald-300 dark:border-emerald-500/40",
    outline: "border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

