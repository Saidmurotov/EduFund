import { useState, useEffect } from "react";

const CATEGORIES = {
  "Texnologiya": ["Computer Science", "IT & Software", "Engineering", "Data Science", "AI/ML", "Cybersecurity"],
  "Tibbiyot": ["Medicine", "Pharmacy", "Biology", "Public Health", "Dentistry"],
  "Iqtisod": ["Economics", "Business", "Finance", "Management", "Marketing", "Accounting"],
  "Ijtimoiy": ["Law", "Political Science", "International Relations", "Sociology", "Psychology"],
  "San'at": ["Design", "Architecture", "Fine Arts", "Music", "Media"],
  "Boshqa": ["Education", "Agriculture", "Environment", "Physics", "Chemistry", "Mathematics", "Other"]
};

export default function FieldSelector({ value, onChange }) {
  const [isOther, setIsOther] = useState(false);
  const [otherValue, setOtherValue] = useState("");

  // Determine if the current value matches a predefined option
  useEffect(() => {
    let found = false;
    for (const cat in CATEGORIES) {
      if (CATEGORIES[cat].includes(value)) {
        found = true;
        break;
      }
    }
    
    if (value && !found && value !== "Other") {
      setIsOther(true);
      setOtherValue(value);
    } else if (value === "Other") {
      setIsOther(true);
      setOtherValue("");
    } else if (!value) {
      setIsOther(false);
      setOtherValue("");
    } else {
      setIsOther(false);
    }
  }, [value, otherValue]);

  const handleChipClick = (item) => {
    if (item === "Other") {
      setIsOther(true);
      onChange(otherValue || "");
    } else {
      setIsOther(false);
      setOtherValue("");
      onChange(item);
    }
  };

  const handleOtherChange = (e) => {
    setOtherValue(e.target.value);
    onChange(e.target.value);
  };

  const isMatched = (item) => {
    if (item === "Other" && isOther) return true;
    return value === item && !isOther;
  };

  return (
    <div className="space-y-5">
      {Object.keys(CATEGORIES).map((category) => (
        <div key={category}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {category}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES[category].map((item) => {
              const active = isMatched(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleChipClick(item)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    active
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "bg-[#1E293B] text-gray-200 border-[#334155] hover:border-[#475569]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {isOther && (
        <div className="mt-4 animate-[fadeIn_200ms_ease-in]">
          <input
            type="text"
            className="w-full rounded-xl bg-white border-2 border-[#E5E7EB] px-4 py-3 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3D3DC4] focus:ring-2 focus:ring-[#3D3DC4]/20 transition-all shadow-sm"
            placeholder="Yo'nalishingizni kiriting..."
            value={otherValue}
            onChange={handleOtherChange}
            autoFocus
          />
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
