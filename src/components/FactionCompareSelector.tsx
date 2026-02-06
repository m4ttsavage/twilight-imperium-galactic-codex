import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { TI4_FACTIONS } from "@/lib/factions";
import type { FactionDetail } from "@/lib/faction-details";
import { FACTION_DETAILS } from "@/lib/faction-details";

interface FactionCompareSelectorProps {
  selected: FactionDetail | null;
  onSelect: (faction: FactionDetail | null) => void;
  otherSelected: FactionDetail | null;
  label: string;
}

const FactionCompareSelector = ({
  selected,
  onSelect,
  otherSelected,
  label,
}: FactionCompareSelectorProps) => {
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

  const factionIcon = (name: string) =>
    TI4_FACTIONS.find((f) => f.name === name)?.icon;

  const filtered = FACTION_DETAILS.filter(
    (f) =>
      f.name !== otherSelected?.name &&
      (f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.shortName.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div ref={ref} className="relative">
      <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1 block">
        {label}
      </span>

      {selected ? (
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border hover:border-gold/30 transition-colors text-left"
        >
          <img
            src={factionIcon(selected.name)}
            alt={selected.shortName}
            className="w-7 h-7 object-contain flex-shrink-0"
          />
          <span className="font-display text-xs text-foreground tracking-wide truncate flex-1">
            {selected.shortName}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </button>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-dashed border-border hover:border-gold/30 transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-xs font-body text-muted-foreground">
            Select a faction…
          </span>
        </button>
      )}

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl bg-card border border-border shadow-xl max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-muted/40 border border-border text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-teal/40 transition-colors"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.map((f) => (
              <button
                key={f.name}
                onClick={() => {
                  onSelect(f);
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/40 transition-colors text-left"
              >
                <img
                  src={factionIcon(f.name)}
                  alt={f.shortName}
                  className="w-5 h-5 object-contain flex-shrink-0"
                />
                <span className="text-xs font-body text-foreground truncate">
                  {f.name}
                </span>
              </button>
            ))}
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

export default FactionCompareSelector;
