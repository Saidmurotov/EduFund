export default function Navbar() {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-accent flex items-center justify-center text-sm font-bold">
            EF
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-50">EduFund AI</span>
            <span className="text-xs text-slate-400">
              Grant & stipendiya assistant
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

