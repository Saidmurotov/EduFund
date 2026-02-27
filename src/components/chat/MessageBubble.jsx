import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message, isUser }) {
  const ts = message?.timestamp ? new Date(message.timestamp) : null;
  const time =
    ts && !Number.isNaN(ts.getTime())
      ? ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

  return (
    <div className={["w-full flex", isUser ? "justify-end" : "justify-start"].join(" ")}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-4 py-3 border",
          isUser
            ? "bg-[#2563EB] text-white border-[#2563EB]"
            : "bg-[#1E293B] text-slate-100 border-[#334155]",
        ].join(" ")}
      >
        {!isUser && (
          <div className="text-[11px] font-semibold text-slate-300 mb-1">
            EduFund Advisor
          </div>
        )}
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{message?.content || ""}</ReactMarkdown>
        </div>
        <div className="text-[11px] text-[#64748B] mt-2">{time}</div>
      </div>
    </div>
  );
}

