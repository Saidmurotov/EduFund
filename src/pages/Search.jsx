import { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, Filter, X, ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import GrantCard from "../components/dashboard/GrantCard.jsx";
import { api, withAuth } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { COUNTRIES, DEGREE_CHOICES } from "../lib/constants.js";

const GRANT_TYPES = [
  "Scholarship", "Full Grant", "Internship", "Exchange",
  "Conference", "Research", "Stajirovka", "Language Program"
];

const FUNDING_TYPES = ["Full Fund", "Partial", "Stipend"];

export default function Search() {
  const { user, getIdToken } = useAuth();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    types: [],
    countries: [],
    degrees: [],
    minTrust: 0,
    funding: [],
    myMatch: false
  });

  const [sortBy, setSortBy] = useState("match"); // match, deadline, trust, new

  useEffect(() => {
    let timer;
    const fetchGrants = async () => {
      setLoading(true);
      try {
        const headers = await withAuth(getIdToken);
        const params = {
          search: searchQuery,
          type: filters.types,
          country: filters.countries,
          degree: filters.degrees,
          minTrust: filters.minTrust,
          fundingType: filters.funding,
          sort: sortBy,
          myMatch: filters.myMatch,
          userId: user?.uid
        };
        const res = await api.get("/grants", { params, headers });
        setGrants(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    timer = setTimeout(fetchGrants, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filters, sortBy, user?.uid, getIdToken]);

  const toggleFilter = (key, value) => {
    setFilters(prev => {
      const arr = [...prev[key]];
      const idx = arr.indexOf(value);
      if (idx > -1) arr.splice(idx, 1);
      else arr.push(value);
      return { ...prev, [key]: arr };
    });
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      countries: [],
      degrees: [],
      minTrust: 0,
      funding: [],
      myMatch: false
    });
  };

  const activeFilterCount = useMemo(() => {
    return filters.types.length + filters.countries.length + filters.degrees.length + filters.funding.length + (filters.minTrust > 0 ? 1 : 0) + (filters.myMatch ? 1 : 0);
  }, [filters]);

  return (
    <div className="py-6 space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#0F172A]/80 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 border-b border-[#334155]/30">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="w-full bg-[#1E293B] border border-[#334155] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#3D3DC4] transition-all"
              placeholder="Grantlarni izlash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={[
              "px-4 rounded-xl border flex items-center gap-2 transition-all",
              isFilterOpen || activeFilterCount > 0
                ? "bg-[#3D3DC4]/10 border-[#3D3DC4] text-[#3D3DC4]"
                : "bg-[#1E293B] border-[#334155] text-slate-400"
            ].join(" ")}
          >
            <Filter size={18} />
            <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider">Filtr</span>
            {activeFilterCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-[#3D3DC4] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Slide-down Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-2xl animate-[slideDown_0.2s_ease-out] max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-50">Filterlar</h3>
              <div className="flex items-center gap-4">
                <button onClick={clearFilters} className="text-xs font-bold text-[#3D3DC4] hover:underline uppercase">Tozalash</button>
                <button onClick={() => setIsFilterOpen(false)} className="p-1 text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
            </div>

            <div className="space-y-8">
              {/* My Match Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]/50 border border-[#334155]/50">
                <div>
                  <div className="text-sm font-bold text-slate-50">Faqat menga mos</div>
                  <div className="text-[10px] text-slate-500">Profil ma'lumotlaringizga asosan</div>
                </div>
                <button
                  onClick={() => setFilters(p => ({ ...p, myMatch: !p.myMatch }))}
                  className={[
                    "w-12 h-6 rounded-full transition-colors relative",
                    filters.myMatch ? "bg-[#3D3DC4]" : "bg-slate-700"
                  ].join(" ")}
                >
                  <div className={[
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    filters.myMatch ? "left-7" : "left-1"
                  ].join(" ")} />
                </button>
              </div>

              {/* Grant Type */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Grant turi</label>
                <div className="flex flex-wrap gap-2">
                  {GRANT_TYPES.map(t => (
                    <Chip
                      key={t}
                      label={t}
                      active={filters.types.includes(t.toLowerCase())}
                      onClick={() => toggleFilter('types', t.toLowerCase())}
                    />
                  ))}
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Davlatlar</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COUNTRIES.slice(0, 12).map(c => (
                    <Chip
                      key={c}
                      label={c}
                      active={filters.countries.includes(c)}
                      onClick={() => toggleFilter('countries', c)}
                    />
                  ))}
                </div>
              </div>

              {/* Academic Degree */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Ta'lim darajasi</label>
                <div className="flex flex-wrap gap-2">
                  {DEGREE_CHOICES.map(d => (
                    <Chip
                      key={d.value}
                      label={d.label}
                      active={filters.degrees.includes(d.value)}
                      onClick={() => toggleFilter('degrees', d.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Trust Score */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trust Score</label>
                  <span className="text-xs font-bold text-[#3D3DC4]">{filters.minTrust}+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minTrust}
                  onChange={(e) => setFilters(p => ({ ...p, minTrust: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-[#0F172A] rounded-lg appearance-none cursor-pointer accent-[#3D3DC4]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-400">
          {loading ? "Qidirilmoqda..." : `${grants.length} ta grant topildi`}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort by:</span>
          <select
            className="bg-transparent text-xs font-bold text-[#3D3DC4] focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="match">Match %</option>
            <option value="deadline">Deadline</option>
            <option value="trust">Trust Score</option>
            <option value="new">Yangi</option>
          </select>
        </div>
      </div>

      {/* Grants List */}
      {loading && !grants.length ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 w-full bg-[#1E293B] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          {grants.map(g => (
            <GrantCard key={g.id || g.opportunityId} grant={g} matchPercent={g.matchPercent} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2",
        active
          ? "bg-[#3D3DC4] border-[#3D3DC4] text-white"
          : "bg-[#0F172A] border-[#334155] text-slate-400 hover:border-slate-500"
      ].join(" ")}
    >
      {label}
      {active && <Check size={12} />}
    </button>
  );
}
