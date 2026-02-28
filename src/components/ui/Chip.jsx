export default function Chip({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                active
                    ? "bg-[#2563EB] border-[#2563EB] text-white"
                    : "bg-[#1E293B] border-[#334155] text-slate-200 hover:border-slate-400",
            ].join(" ")}
        >
            {children}
        </button>
    );
}
