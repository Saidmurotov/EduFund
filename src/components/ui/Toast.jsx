import { X } from "lucide-react";

const styles = {
  success: "bg-[#10B981] text-white",
  error: "bg-[#EF4444] text-white",
  warning: "bg-[#F59E0B] text-white",
  info: "bg-[#2563EB] text-white",
};

export default function Toast({ message, type = "info", onClose }) {
  return (
    <div
      className={[
        "w-[320px] max-w-[92vw] rounded-2xl shadow-2xl overflow-hidden",
        "border border-white/10",
        "animate-[toastIn_250ms_ease-out]",
        styles[type] || styles.info,
      ].join(" ")}
      role="status"
    >
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="text-sm font-semibold">{message}</div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

