import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { TI4_FACTIONS, type Faction } from "@/lib/factions";

interface FactionSearchSelectProps {
  value: string;
  onChange: (factionName: string) => void;
  /** Faction names to exclude (already used by other players) */
  exclude?: string[];
  placeholder?: string;
  label?: string;
  compact?: boolean;
}

const FactionSearchSelect = ({
  value,
  onChange,
  exclude = [],
  placeholder = "Select a faction…",
  label,
  compact = false,
}: FactionSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedFaction = TI4_FACTIONS.find((f) => f.name === value);

  const filtered = TI4_FACTIONS.filter(
    (f) =>
      !exclude.includes(f.name) &&
      (f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.shortName.toLowerCase().includes(search.toLowerCase())),
  );

  const baseFactions = filtered.filter((f) => f.expansion === "base");
  const pokFactions = filtered.filter((f) => f.expansion === "pok");
  const teFactions = filtered.filter((f) => f.expansion === "te");

  const renderGroup = (label: string, factions: Faction[]) => {
    if (factions.length === 0) return null;
    return (
      <div key={label}>
        <p className="text-[9px] font-display uppercase tracking-widest text-muted-foreground px-3 py-1">
          {label}
        </p>
        {factions.map((f) => (
          <button
            key={f.name}
            onClick={() => {
              onChange(f.name);
              setOpen(false);
              setSearch("");
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted/40 transition-colors text-left"
          >
            <img
              src={f.icon}
              alt={f.shortName}
              className="w-5 h-5 object-contain flex-shrink-0"
            />
            <span className="text-xs font-body text-foreground truncate">
              {f.name}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const h = compact ? "h-7" : "h-8";

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="text-[9px] font-display uppercase tracking-wider text-muted-foreground mb-1 block">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-2 ${h} rounded bg-card border border-border hover:border-gold/30 transition-colors text-left`}
      >
        {selectedFaction ? (
          <>
            <img
              src={selectedFaction.icon}
              alt={selectedFaction.shortName}
              className="w-4 h-4 object-contain flex-shrink-0"
            />
            <span className="text-[11px] font-body text-foreground truncate flex-1">
              {selectedFaction.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setSearch("");
              }}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-[11px] font-body text-muted-foreground truncate flex-1">
              {placeholder}
            </span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg bg-card border border-border shadow-xl max-h-56 overflow-hidden flex flex-col">
          <div className="p-1.5 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-6 pr-2 py-1 rounded bg-muted/40 border border-border text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-teal/40 transition-colors"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {renderGroup("Base Game", baseFactions)}
            {renderGroup("Prophecy of Kings", pokFactions)}
            {renderGroup("Thunder's Edge", teFactions)}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground font-body p-3 text-center">
                No factions found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FactionSearchSelect;
