export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60";

  const variants = {
    primary: "bg-[#2563EB] text-white hover:bg-blue-500 focus:ring-[#2563EB]",
    outline:
      "border border-slate-700 text-slate-100 hover:bg-slate-800 focus:ring-slate-600",
    ghost: "text-slate-300 hover:bg-slate-800/60 focus:ring-slate-600",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

