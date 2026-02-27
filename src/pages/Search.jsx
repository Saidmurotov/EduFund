import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import GrantCard from "../components/dashboard/GrantCard.jsx";
import { SkeletonGrantList } from "../components/ui/Skeleton.jsx";
import { api, withAuth } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";

const COUNTRIES = [
  "Germany",
  "South Korea",
  "USA",
  "UK",
  "Austria",
  "Japan",
  "France",
];

const DEGREES = [
  { label: "Bakalavr", value: "bachelor" },
  { label: "Magistr", value: "master" },
  { label: "PhD", value: "phd" },
];

const TYPES = ["Full Fund", "Partial", "Internship", "Exchange"];

function toTypeValue(label) {
  const map = {
    "Full Fund": "full",
    Partial: "partial",
    Internship: "internship",
    Exchange: "exchange",
  };
  return map[label] || label;
}

function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function Search() {
  const { getIdToken } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounced(searchQuery, 500);

  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedDegrees, setSelectedDegrees] = useState([]); // values
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [minTrust, setMinTrust] = useState(0);
  const [sort, setSort] = useState("match");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [grants, setGrants] = useState([]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    selectedCountries.forEach((c) => params.append("country", c));
    selectedDegrees.forEach((d) => params.append("degree", d));
    selectedTypes.forEach((t) => params.append("type", toTypeValue(t)));
    if (debouncedQuery) params.set("search", debouncedQuery);
    if (minTrust) params.set("minTrust", String(minTrust));
    if (sort) params.set("sort", sort);
    return params;
  }, [
    selectedCountries,
    selectedDegrees,
    selectedTypes,
    debouncedQuery,
    minTrust,
    sort,
  ]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const headers = await withAuth(getIdToken);
        const res = await api.get(`/grants?${queryParams.toString()}`, {
          headers,
        });
        if (!alive) return;
        setGrants(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("Qidirishda xato yuz berdi.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [queryParams, getIdToken]);

  const toggle = (value, arr, setArr) => {
    setArr((p) => (p.includes(value) ? p.filter((x) => x !== value) : [...p, value]));
  };

  const clearAll = () => {
    setSelectedCountries([]);
    setSelectedDegrees([]);
    setSelectedTypes([]);
    setMinTrust(0);
    setSearchQuery("");
    setSort("match");
  };

  return (
    <div className="py-8 space-y-4">
      <div className="relative">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
          size={18}
        />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Grant qidiring..."
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#1E293B] border border-[#334155] text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-slate-200"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <Card className="bg-[#1E293B] border-[#334155] rounded-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-50">Filters</div>
          <Button type="button" variant="ghost" onClick={clearAll}>
            Tozalash
          </Button>
        </div>

        <div className="mt-4 space-y-5">
          <div>
            <div className="text-sm text-slate-200 mb-2">Davlat</div>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle(c, selectedCountries, setSelectedCountries)}
                  className={[
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    selectedCountries.includes(c)
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "bg-[#0F172A] text-slate-200 border-[#334155]",
                  ].join(" ")}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-200 mb-2">Ta'lim darajasi</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEGREES.map((d) => (
                <label
                  key={d.value}
                  className="flex items-center gap-2 text-sm text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedDegrees.includes(d.value)}
                    onChange={() =>
                      toggle(d.value, selectedDegrees, setSelectedDegrees)
                    }
                    className="accent-[#2563EB]"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-200 mb-2">Grant turi</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t)}
                    onChange={() => toggle(t, selectedTypes, setSelectedTypes)}
                    className="accent-[#2563EB]"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-200">Trust Score</div>
              <div className="text-sm text-slate-300">{minTrust}</div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={minTrust}
              onChange={(e) => setMinTrust(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-300">{grants.length} ta grant topildi</div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg bg-[#1E293B] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <option value="match">Match % bo'yicha</option>
          <option value="deadline">Deadline bo'yicha</option>
          <option value="trust">Trust Score bo'yicha</option>
        </select>
      </div>

      {loading ? (
        <SkeletonGrantList />
      ) : error ? (
        <div className="text-sm text-[#EF4444] bg-[#1E293B] border border-[#EF4444]/40 rounded-lg px-3 py-2">
          {error}
        </div>
      ) : grants.length === 0 ? (
        <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
          <div className="text-slate-50 font-semibold">Hech narsa topilmadi</div>
          <div className="text-sm text-slate-400 mt-1">
            Filterlarni tozalab qaytadan urinib ko'ring.
          </div>
          <div className="mt-3">
            <Button type="button" onClick={clearAll}>
              Filterlarni tozalash
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {grants.map((g) => (
            <GrantCard key={g.id || g.opportunityId} grant={g} matchPercent={g.matchPercent} />
          ))}
        </div>
      )}
    </div>
  );
}

