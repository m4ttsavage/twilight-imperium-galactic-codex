import { Cpu, Users, Swords, Rocket, Star, Zap } from "lucide-react";
import { TI4_FACTIONS } from "@/lib/factions";
import type { FactionDetail } from "@/lib/faction-details";

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

interface ComparisonColumnProps {
  faction: FactionDetail;
}

const ComparisonColumn = ({ faction }: ComparisonColumnProps) => {
  const icon = TI4_FACTIONS.find((f) => f.name === faction.name)?.icon;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <img
          src={icon}
          alt={faction.shortName}
          className="w-12 h-12 object-contain"
        />
        <div>
          <h2 className="font-display text-sm text-foreground tracking-wide">
            {faction.shortName}
          </h2>
          <p className="text-[10px] text-muted-foreground font-body italic">
            {faction.tagline}
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-center">
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full border font-display uppercase tracking-wider ${difficultyColor[faction.difficulty]}`}
          >
            {faction.difficulty}
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full border font-display uppercase tracking-wider ${expansionColor[faction.expansion]}`}
          >
            {expansionLabel[faction.expansion]}
          </span>
        </div>
      </div>

      {/* Playstyle */}
      <Section icon={Swords} title="Playstyle" accent="gold">
        <p className="text-[11px] font-body text-foreground/80 leading-relaxed italic">
          {faction.playstyle}
        </p>
      </Section>

      {/* Abilities */}
      <Section icon={Zap} title="Abilities" accent="gold">
        {faction.abilities.map((a) => (
          <div key={a.name} className="space-y-0.5">
            <span className="text-[11px] font-display text-gold tracking-wide">
              {a.name}
            </span>
            <p className="text-[10px] font-body text-foreground/70 leading-relaxed">
              {a.description}
            </p>
          </div>
        ))}
      </Section>

      {/* Starting Tech */}
      <Section icon={Cpu} title="Starting Tech" accent="teal">
        {faction.startingTech.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {faction.startingTech.map((t) => (
              <span
                key={t}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-teal/10 text-teal border border-teal/20 font-body"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground font-body">None</p>
        )}
      </Section>

      {/* Starting Units */}
      <Section icon={Rocket} title="Starting Units" accent="gold">
        <div className="flex flex-wrap gap-1">
          {faction.startingUnits.map((u, i) => (
            <span
              key={i}
              className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-foreground/70 border border-border font-body"
            >
              {u}
            </span>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground font-body mt-1">
          Commodities: {faction.commodities}
        </p>
      </Section>

      {/* Flagship & Mech */}
      <Section icon={Star} title="Flagship & Mech" accent="gold">
        <div className="space-y-1.5">
          <div>
            <span className="text-[10px] font-display text-gold tracking-wide">
              ⚓ {faction.flagshipName}
            </span>
            <p className="text-[10px] font-body text-foreground/70 leading-relaxed">
              {faction.flagshipAbility}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-display text-gold tracking-wide">
              🤖 {faction.mechName}
            </span>
            <p className="text-[10px] font-body text-foreground/70 leading-relaxed">
              {faction.mechAbility}
            </p>
          </div>
        </div>
      </Section>

      {/* Leaders */}
      <Section icon={Users} title="Leaders" accent="teal">
        <div className="space-y-1.5">
          {faction.leaders.map((l) => (
            <div key={l.name}>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[8px] px-1 py-0.5 rounded-full border font-display uppercase tracking-wider ${
                    l.type === "hero"
                      ? "text-gold bg-gold/10 border-gold/30"
                      : l.type === "commander"
                      ? "text-teal bg-teal/10 border-teal/30"
                      : "text-muted-foreground bg-muted border-border"
                  }`}
                >
                  {l.type}
                </span>
                <span className="text-[10px] font-display text-foreground tracking-wide truncate">
                  {l.name}
                </span>
              </div>
              <p className="text-[10px] font-body text-foreground/70 leading-relaxed mt-0.5">
                {l.ability}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Breakthrough Synergy */}
      {faction.breakthroughSynergy && (
        <Section icon={Swords} title="Breakthrough" accent="teal">
          <p className="text-[10px] font-body text-foreground/70 leading-relaxed">
            {faction.breakthroughSynergy}
          </p>
        </Section>
      )}
    </div>
  );
};

function Section({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: React.ElementType;
  title: string;
  accent: "gold" | "teal";
  children: React.ReactNode;
}) {
  const color = accent === "gold" ? "text-gold" : "text-teal";
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className={`text-[9px] font-display uppercase tracking-widest ${color}`}>
          {title}
        </span>
      </div>
      <div className="space-y-1.5 pl-[18px]">{children}</div>
    </div>
  );
}

export default ComparisonColumn;
