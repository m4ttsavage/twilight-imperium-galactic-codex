import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GitCompareArrows, ArrowLeft } from "lucide-react";
import type { FactionDetail } from "@/lib/faction-details";
import FactionCompareSelector from "@/components/FactionCompareSelector";
import ComparisonColumn from "@/components/ComparisonColumn";
import TopNav from "@/components/TopNav";
import heroBg from "@/assets/hero-bg.jpg";

const FactionCompare = () => {
  const [factionA, setFactionA] = useState<FactionDetail | null>(null);
  const [factionB, setFactionB] = useState<FactionDetail | null>(null);

  const bothSelected = factionA && factionB;

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full">
        <TopNav />
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0 px-4 pb-4"
        >

          <div className="flex items-center gap-3 mb-4">
            <Link
              to="/factions"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-[10px] font-display uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Factions
            </Link>
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center glow-gold">
              <GitCompareArrows className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-sm tracking-widest text-foreground uppercase">
                Faction Comparison
              </h1>
              <p className="text-[10px] font-body text-muted-foreground tracking-wide">
                Select two factions to compare side-by-side
              </p>
            </div>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <FactionCompareSelector
              selected={factionA}
              onSelect={setFactionA}
              otherSelected={factionB}
              label="Faction A"
            />
            <FactionCompareSelector
              selected={factionB}
              onSelect={setFactionB}
              otherSelected={factionA}
              label="Faction B"
            />
          </div>
        </motion.header>

        {/* Comparison */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {bothSelected ? (
            <motion.div
              key={`${factionA.name}-${factionB.name}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Divider columns */}
              <div className="rounded-xl border border-border bg-card/60 p-3">
                <ComparisonColumn faction={factionA} />
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-3">
                <ComparisonColumn faction={factionB} />
              </div>

              {/* Matchup summary */}
              <div className="col-span-2 rounded-xl border border-gold/20 bg-card/60 p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <GitCompareArrows className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[10px] font-display uppercase tracking-widest text-gold">
                    Matchup Analysis
                  </span>
                </div>
                <MatchupSummary a={factionA} b={factionB} />
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground font-body text-center">
                Select two factions above to begin comparing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function MatchupSummary({
  a,
  b,
}: {
  a: FactionDetail;
  b: FactionDetail;
}) {
  const techAdvantage = compareTech(a, b);
  const unitAdvantage = compareUnits(a, b);
  const commodityDiff = a.commodities - b.commodities;

  return (
    <div className="space-y-2 pl-[18px]">
      {/* Tech comparison */}
      <CompareRow
        label="Starting Tech"
        valueA={`${a.startingTech.length} tech${a.startingTech.length !== 1 ? "s" : ""}`}
        valueB={`${b.startingTech.length} tech${b.startingTech.length !== 1 ? "s" : ""}`}
        advantage={techAdvantage}
        nameA={a.shortName}
        nameB={b.shortName}
      />

      {/* Units comparison */}
      <CompareRow
        label="Starting Units"
        valueA={`${a.startingUnits.length} unit types`}
        valueB={`${b.startingUnits.length} unit types`}
        advantage={unitAdvantage}
        nameA={a.shortName}
        nameB={b.shortName}
      />

      {/* Commodities */}
      <CompareRow
        label="Commodities"
        valueA={String(a.commodities)}
        valueB={String(b.commodities)}
        advantage={commodityDiff > 0 ? "a" : commodityDiff < 0 ? "b" : "tie"}
        nameA={a.shortName}
        nameB={b.shortName}
      />

      {/* Abilities count */}
      <CompareRow
        label="Faction Abilities"
        valueA={String(a.abilities.length)}
        valueB={String(b.abilities.length)}
        advantage={
          a.abilities.length > b.abilities.length
            ? "a"
            : a.abilities.length < b.abilities.length
            ? "b"
            : "tie"
        }
        nameA={a.shortName}
        nameB={b.shortName}
      />

      {/* Difficulty */}
      <div className="flex items-center justify-between text-[10px] font-body">
        <span className="text-muted-foreground w-28">Difficulty</span>
        <span className="text-foreground/80 flex-1 text-center">{a.difficulty}</span>
        <span className="text-muted-foreground/50 px-2">vs</span>
        <span className="text-foreground/80 flex-1 text-center">{b.difficulty}</span>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  valueA,
  valueB,
  advantage,
  nameA,
  nameB,
}: {
  label: string;
  valueA: string;
  valueB: string;
  advantage: "a" | "b" | "tie";
  nameA: string;
  nameB: string;
}) {
  return (
    <div className="flex items-center justify-between text-[10px] font-body">
      <span className="text-muted-foreground w-28">{label}</span>
      <span
        className={`flex-1 text-center ${
          advantage === "a" ? "text-gold font-semibold" : "text-foreground/80"
        }`}
      >
        {valueA}
      </span>
      <span className="text-muted-foreground/50 px-2">vs</span>
      <span
        className={`flex-1 text-center ${
          advantage === "b" ? "text-gold font-semibold" : "text-foreground/80"
        }`}
      >
        {valueB}
      </span>
    </div>
  );
}

function compareTech(a: FactionDetail, b: FactionDetail): "a" | "b" | "tie" {
  if (a.startingTech.length > b.startingTech.length) return "a";
  if (a.startingTech.length < b.startingTech.length) return "b";
  return "tie";
}

function compareUnits(a: FactionDetail, b: FactionDetail): "a" | "b" | "tie" {
  if (a.startingUnits.length > b.startingUnits.length) return "a";
  if (a.startingUnits.length < b.startingUnits.length) return "b";
  return "tie";
}

export default FactionCompare;
