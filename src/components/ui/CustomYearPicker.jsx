import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomYearPicker({ value, onChange, min = 1975, max = 2007 }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Yo'qolib ketishi uchun click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Yillarni generatsiya qilish (max dan min ga qarab)
  const years = [];
  for (let i = max; i >= min; i--) {
    years.push(i);
  }

  const handleSelect = (year) => {
    onChange(year);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-4 flex items-center justify-between cursor-pointer text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || "Tug'ilgan yilingizni tanlang"}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 top-full mt-2 w-full bg-[#1E293B] border border-[#334155] rounded-xl shadow-lg overflow-hidden">
          <ul className="max-h-[200px] overflow-y-auto py-2 custom-scrollbar">
            {years.map((year) => {
              const isSelected = value === String(year) || value === year;
              return (
                <li
                  key={year}
                  onClick={() => handleSelect(String(year))}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors duration-150 ${
                    isSelected
                      ? "bg-[#2563EB]/20 text-[#2563EB]"
                      : "text-white hover:bg-[#2563EB]/20"
                  }`}
                >
                  <span className={isSelected ? "font-medium" : ""}>
                    {year}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
