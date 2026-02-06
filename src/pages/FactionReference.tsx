import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, GitCompareArrows, Map, ArrowUpAZ, ArrowDownAZ, ChevronDown, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { FACTION_DETAILS } from "@/lib/faction-details";
import FactionReferenceCard from "@/components/FactionReferenceCard";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/hooks/useAuth";
import heroBg from "@/assets/hero-bg.jpg";

type Expansion = "base" | "pok" | "te";
type Difficulty = "low" | "medium" | "high";

const expansionOptions: { value: Expansion; label: string }[] = [
  { value: "base", label: "Base" },
  { value: "pok", label: "PoK" },
  { value: "te", label: "Thunder's Edge" },
];

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface MultiSelectDropdownProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (selected: T[]) => void;
  accentClass: string;
}

function MultiSelectDropdown<T extends string>({ label, options, selected, onChange, accentClass }: MultiSelectDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (value: T) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  const allSelected = selected.length === 0;
  const summary = allSelected ? "All" : options.filter((o) => selected.includes(o.value)).map((o) => o.label).join(", ");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-body transition-colors border ${accentClass}`}
      >
        <span className="text-[9px] font-display uppercase tracking-wider opacity-70 mr-0.5">{label}:</span>
        <span className="max-w-[120px] truncate">{summary}</span>
        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] rounded-lg border border-border bg-card shadow-lg py-1">
          {options.map((o) => {
            const isSelected = selected.includes(o.value);
            return (
              <button
                key={o.value}
                onClick={() => toggle(o.value)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] font-body hover:bg-muted/50 transition-colors text-foreground"
              >
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-teal/20 border-teal/50" : "border-border"}`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-teal" />}
                </span>
                {o.label}
              </button>
            );
          })}
          {selected.length > 0 && (
            <>
              <div className="border-t border-border my-1" />
              <button
                onClick={() => onChange([])}
                className="w-full px-3 py-1.5 text-[10px] font-body text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const FactionReference = () => {
  const [search, setSearch] = useState("");
  const [expansions, setExpansions] = useState<Expansion[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const filteredFactions = useMemo(() => {
    return FACTION_DETAILS.filter((f) => {
      if (expansions.length > 0 && !expansions.includes(f.expansion as Expansion)) return false;
      if (difficulties.length > 0 && !difficulties.includes(f.difficulty as Difficulty)) return false;
      if (
        search &&
        !f.name.toLowerCase().includes(search.toLowerCase()) &&
        !f.shortName.toLowerCase().includes(search.toLowerCase()) &&
        !f.tagline.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    }).sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  }, [search, expansions, difficulties, sortAsc]);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background">
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full max-w-3xl mx-auto w-full">
        <TopNav />
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0 px-4 pt-2 pb-3"
        >
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center glow-teal">
                <BookOpen className="w-5 h-5 text-teal" />
              </div>
              <div className="flex-1">
                <h1 className="font-display text-sm tracking-widest text-foreground uppercase">
                  Faction Reference
                </h1>
                <p className="text-[10px] font-body text-muted-foreground tracking-wide">
                  {FACTION_DETAILS.length} factions across 3 expansions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/map"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors text-[10px] font-display uppercase tracking-wider"
              >
                <Map className="w-3.5 h-3.5" />
                Map
              </Link>
              <Link
                to="/factions/compare"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/10 border border-teal/30 text-teal hover:bg-teal/20 transition-colors text-[10px] font-display uppercase tracking-wider"
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
                Compare
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search factions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/40 border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-teal/40 focus:ring-1 focus:ring-teal/20 transition-colors"
            />
          </div>

          {/* Filters — single row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3 h-3 text-muted-foreground" />
            <button
              onClick={() => setSortAsc((prev) => !prev)}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-body transition-colors bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30"
            >
              {sortAsc ? <ArrowUpAZ className="w-3 h-3" /> : <ArrowDownAZ className="w-3 h-3" />}
              {sortAsc ? "A → Z" : "Z → A"}
            </button>
            <MultiSelectDropdown
              label="Expansion"
              options={expansionOptions}
              selected={expansions}
              onChange={setExpansions}
              accentClass="bg-teal/10 text-teal border-teal/30 hover:bg-teal/20"
            />
            <MultiSelectDropdown
              label="Difficulty"
              options={difficultyOptions}
              selected={difficulties}
              onChange={setDifficulties}
              accentClass="bg-gold/10 text-gold border-gold/30 hover:bg-gold/20"
            />
          </div>
        </motion.header>

        {/* Faction list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex-1 overflow-y-auto px-4 pb-6 space-y-2"
        >
          {filteredFactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground font-body">
                No factions match your filters
              </p>
            </div>
          ) : (
            filteredFactions.map((f) => (
              <FactionReferenceCard key={f.name} faction={f} />
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FactionReference;
