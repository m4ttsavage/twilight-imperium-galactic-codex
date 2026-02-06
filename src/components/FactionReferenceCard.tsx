import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Users,
  Swords,
  Rocket,
  Star,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { FactionDetail } from "@/lib/faction-details";
import { TI4_FACTIONS } from "@/lib/factions";

interface FactionReferenceCardProps {
  faction: FactionDetail;
}

const difficultyColor: Record<string, string> = {
  low: "text-green-400 bg-green-400/10 border-green-400/30",
  medium: "text-gold bg-gold/10 border-gold/30",
  high: "text-red-400 bg-red-400/10 border-red-400/30",
};

const expansionColor: Record<string, string> = {
  base: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  pok: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  te: "text-teal bg-teal/10 border-teal/30",
};

const expansionLabel: Record<string, string> = {
  base: "Base",
  pok: "PoK",
  te: "Thunder's Edge",
};

const FactionReferenceCard = ({ faction }: FactionReferenceCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-card overflow-hidden hover:border-gold/30 transition-colors"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img
            src={TI4_FACTIONS.find((f) => f.name === faction.name)?.icon}
            alt={faction.shortName}
            className="w-8 h-8 object-contain"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-sm text-foreground tracking-wide truncate">
              {faction.name}
            </h3>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full border font-display uppercase tracking-wider ${difficultyColor[faction.difficulty]}`}
            >
              {faction.difficulty}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">
            {faction.tagline}
          </p>
          <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full border font-display uppercase tracking-wider ${expansionColor[faction.expansion]}`}
            >
              {expansionLabel[faction.expansion]}
            </span>
        </div>

        <div className="flex-shrink-0 text-muted-foreground mt-1">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pb-4 space-y-4"
        >
          {/* Playstyle */}
          <p className="text-xs font-body text-muted-foreground italic border-l-2 border-gold/30 pl-3">
            {faction.playstyle}
          </p>

          {/* Abilities */}
          <Section icon={Zap} title="Faction Abilities" accentColor="gold">
            {faction.abilities.map((a) => (
              <div key={a.name} className="space-y-0.5">
                <span className="text-[11px] font-display text-gold tracking-wide">
                  {a.name}
                </span>
                <p className="text-[11px] font-body text-foreground/80 leading-relaxed">
                  {a.description}
                </p>
              </div>
            ))}
          </Section>

          {/* Starting Tech */}
          <Section icon={Cpu} title="Starting Technology" accentColor="teal">
            {faction.startingTech.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {faction.startingTech.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-1 rounded-md bg-teal/10 text-teal border border-teal/20 font-body"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground font-body">
                None — starts with no technology
              </p>
            )}
          </Section>

          {/* Starting Units */}
          <Section icon={Rocket} title="Starting Units" accentColor="gold">
            <div className="flex flex-wrap gap-1.5">
              {faction.startingUnits.map((u, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-1 rounded-md bg-muted text-foreground/70 border border-border font-body"
                >
                  {u}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground font-body mt-1">
              Commodities: {faction.commodities}
            </p>
          </Section>

          {/* Flagship & Mech */}
          <Section icon={Star} title="Flagship & Mech" accentColor="gold">
            <div className="space-y-2">
              <div>
                <span className="text-[11px] font-display text-gold tracking-wide">
                  ⚓ {faction.flagshipName}
                </span>
                <p className="text-[11px] font-body text-foreground/80 leading-relaxed">
                  {faction.flagshipAbility}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-display text-gold tracking-wide">
                  🤖 {faction.mechName}
                </span>
                <p className="text-[11px] font-body text-foreground/80 leading-relaxed">
                  {faction.mechAbility}
                </p>
              </div>
            </div>
          </Section>

          {/* Leaders */}
          <Section icon={Users} title="Leaders" accentColor="teal">
            <div className="space-y-2">
              {faction.leaders.map((l) => (
                <div key={l.name}>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full border font-display uppercase tracking-wider ${
                        l.type === "hero"
                          ? "text-gold bg-gold/10 border-gold/30"
                          : l.type === "commander"
                          ? "text-teal bg-teal/10 border-teal/30"
                          : "text-muted-foreground bg-muted border-border"
                      }`}
                    >
                      {l.type}
                    </span>
                    <span className="text-[11px] font-display text-foreground tracking-wide">
                      {l.name}
                    </span>
                  </div>
                  <p className="text-[11px] font-body text-foreground/80 leading-relaxed mt-0.5">
                    {l.ability}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Breakthrough Synergy (TE only) */}
          {faction.breakthroughSynergy && (
            <Section icon={Swords} title="Breakthrough Synergy" accentColor="teal">
              <p className="text-[11px] font-body text-foreground/80 leading-relaxed">
                {faction.breakthroughSynergy}
              </p>
            </Section>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

function Section({
  icon: Icon,
  title,
  accentColor,
  children,
}: {
  icon: React.ElementType;
  title: string;
  accentColor: "gold" | "teal";
  children: React.ReactNode;
}) {
  const color = accentColor === "gold" ? "text-gold" : "text-teal";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3 h-3 ${color}`} />
        <span
          className={`text-[10px] font-display uppercase tracking-widest ${color}`}
        >
          {title}
        </span>
      </div>
      <div className="space-y-2 pl-[18px]">{children}</div>
    </div>
  );
}

export default FactionReferenceCard;
