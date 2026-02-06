import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, GitCompareArrows, Map, ArrowUpAZ, ArrowDownAZ } from "lucide-react";
import { Link } from "react-router-dom";
import { FACTION_DETAILS } from "@/lib/faction-details";
import FactionReferenceCard from "@/components/FactionReferenceCard";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/hooks/useAuth";
import heroBg from "@/assets/hero-bg.jpg";

type Expansion = "all" | "base" | "pok" | "te";
type Difficulty = "all" | "low" | "medium" | "high";

const expansionFilters: { value: Expansion; label: string }[] = [
  { value: "all", label: "All" },
  { value: "base", label: "Base" },
  { value: "pok", label: "PoK" },
  { value: "te", label: "Thunder's Edge" },
];

const difficultyFilters: { value: Difficulty; label: string }[] = [
  { value: "all", label: "Any" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const FactionReference = () => {
  const [search, setSearch] = useState("");
  const [expansion, setExpansion] = useState<Expansion>("all");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [sortAsc, setSortAsc] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const filteredFactions = useMemo(() => {
    return FACTION_DETAILS.filter((f) => {
      if (expansion !== "all" && f.expansion !== expansion) return false;
      if (difficulty !== "all" && f.difficulty !== difficulty) return false;
      if (
        search &&
        !f.name.toLowerCase().includes(search.toLowerCase()) &&
        !f.shortName.toLowerCase().includes(search.toLowerCase()) &&
        !f.tagline.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    }).sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  }, [search, expansion, difficulty, sortAsc]);

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

          {/* Filters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                Sort
              </span>
              <button
                onClick={() => setSortAsc((prev) => !prev)}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-body transition-colors bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30"
              >
                {sortAsc ? <ArrowUpAZ className="w-3 h-3" /> : <ArrowDownAZ className="w-3 h-3" />}
                {sortAsc ? "A → Z" : "Z → A"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                Expansion
              </span>
              <div className="flex gap-1 ml-1">
                {expansionFilters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setExpansion(f.value)}
                    className={`text-[10px] px-2 py-1 rounded-lg font-body transition-colors ${
                      expansion === f.value
                        ? "bg-teal/20 text-teal border border-teal/30"
                        : "bg-muted/30 text-muted-foreground border border-transparent hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                Difficulty
              </span>
              <div className="flex gap-1 ml-1">
                {difficultyFilters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setDifficulty(f.value)}
                    className={`text-[10px] px-2 py-1 rounded-lg font-body transition-colors ${
                      difficulty === f.value
                        ? "bg-gold/20 text-gold border border-gold/30"
                        : "bg-muted/30 text-muted-foreground border border-transparent hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
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
