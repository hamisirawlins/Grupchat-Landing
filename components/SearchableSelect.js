import { useEffect, useRef, useState } from "react";

// Simple searchable select component
// Props:
// - options: [{ name, code }]
// - value: current value (code or empty)
// - onChange: (value) => void - called with selected code
// - placeholder: string
// - id/name className passed through
export default function SearchableSelect({
  options = [],
  value = "",
  onChange = () => {},
  placeholder = "Search...",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const ref = useRef(null);

  // Derived selected label
  const selected = options.find((o) => o.code === value) || null;

  const filtered = query
    ? options.filter(
        (o) =>
          o.name.toLowerCase().includes(query.toLowerCase()) ||
          o.code.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
        setHighlight(0);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    // reset highlight when filtered changes
    setHighlight(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = filtered[highlight];
      if (sel) {
        onChange(sel.code);
        setOpen(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div
        className="w-full"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => {
            const input = ref.current?.querySelector("input");
            if (input) input.focus();
          }, 0);
        }}
      >
        <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white flex items-center justify-between cursor-text">
          <div className="truncate text-left">
            {selected ? (
              <span className="text-gray-900">{selected.name}</span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <div className="text-gray-400">▾</div>
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2">
            <input
              aria-label="Search"
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="max-h-60 overflow-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No results</div>
            ) : (
              filtered.map((o, idx) => (
                <button
                  type="button"
                  key={o.code}
                  onClick={() => {
                    onChange(o.code);
                    setOpen(false);
                    setQuery("");
                  }}
                  onMouseEnter={() => setHighlight(idx)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 ${
                    highlight === idx ? "bg-gray-100" : ""
                  }`}
                >
                  <span className="text-sm text-gray-900">{o.name}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {o.code}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
