function cls(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function SkeletonLine({ width = "full", height = "md" }) {
  const w =
    width === "3/4"
      ? "w-3/4"
      : width === "1/2"
        ? "w-1/2"
        : "w-full";
  const h = height === "sm" ? "h-3" : height === "lg" ? "h-6" : "h-4";

  return (
    <div
      className={cls(
        "rounded bg-[#1E293B] border border-[#334155] animate-pulse",
        w,
        h
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#1E293B] border border-[#334155] p-4 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-[#334155]" />
          <div className="h-3 w-1/2 rounded bg-[#334155]" />
        </div>
        <div className="h-4 w-16 rounded bg-[#334155]" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-[#334155]" />
        <div className="h-5 w-20 rounded-full bg-[#334155]" />
        <div className="h-5 w-24 rounded-full bg-[#334155]" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="h-3 w-40 rounded bg-[#334155]" />
        <div className="h-9 w-28 rounded-lg bg-[#334155]" />
      </div>
    </div>
  );
}

export function SkeletonGrantList() {
  return (
    <div className="space-y-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="py-8 space-y-4">
      <div className="rounded-2xl bg-[#1E293B] border border-[#334155] p-4 animate-pulse">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-2/3 rounded bg-[#334155]" />
            <div className="h-3 w-1/2 rounded bg-[#334155]" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-[#334155]" />
            <div className="h-10 w-10 rounded-full bg-[#334155]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="h-24 rounded-xl bg-[#1E293B] border border-[#334155] animate-pulse" />
        <div className="h-24 rounded-xl bg-[#1E293B] border border-[#334155] animate-pulse" />
      </div>

      <div className="flex items-center justify-between">
        <div className="h-5 w-56 rounded bg-[#1E293B] border border-[#334155] animate-pulse" />
        <div className="h-4 w-16 rounded bg-[#1E293B] border border-[#334155] animate-pulse" />
      </div>

      <SkeletonGrantList />
    </div>
  );
}

