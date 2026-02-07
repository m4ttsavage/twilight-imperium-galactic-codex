import { Trophy, ScrollText } from "lucide-react";
import { TI4_FACTIONS } from "@/lib/factions";
import type { GamePlayerInfo } from "./PlayerList";

interface Props {
  players: GamePlayerInfo[];
  notes: string | null;
}

const GameCompleteSummary = ({ players, notes }: Props) => {
  const sorted = [...players]
    .filter((p) => p.placement !== null)
    .sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99));

  const placementLabel = (n: number) =>
    n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;

  return (
    <div className="rounded-lg border border-gold/20 bg-gold/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-gold" />
        <h3 className="font-display text-xs tracking-widest uppercase text-gold">
          Game Complete
        </h3>
      </div>

      {/* Standings */}
      <div className="space-y-1">
        {sorted.map((p, idx) => {
          const faction = p.faction_name
            ? TI4_FACTIONS.find((f) => f.name === p.faction_name)
            : null;
          const isWinner = p.placement === 1;

          return (
            <div
              key={p.id}
              className={`flex items-center gap-2 rounded-lg border p-2 transition-all ${
                isWinner
                  ? "border-gold/40 bg-gold/10"
                  : "border-border bg-muted/10"
              }`}
            >
              {/* Placement badge */}
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-display uppercase tracking-wider flex-shrink-0 ${
                  isWinner
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "bg-muted/20 text-muted-foreground border border-border"
                }`}
              >
                {isWinner ? (
                  <Trophy className="w-3.5 h-3.5" />
                ) : (
                  placementLabel(p.placement!)
                )}
              </div>

              {/* Faction icon */}
              {faction && (
                <img
                  src={faction.icon}
                  alt={faction.shortName}
                  className="w-5 h-5 rounded object-contain flex-shrink-0"
                />
              )}

              {/* Name + faction */}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-body text-foreground truncate block">
                  {p.nickname || "Player"}
                </span>
                {faction && (
                  <span className="text-[9px] font-body text-muted-foreground truncate block">
                    {faction.shortName}
                  </span>
                )}
              </div>

              {/* VP */}
              <div className="text-right flex-shrink-0">
                <span
                  className={`text-[11px] font-display tracking-wider ${
                    isWinner ? "text-gold" : "text-foreground"
                  }`}
                >
                  {p.victory_points ?? "—"}
                </span>
                <span className="text-[8px] font-body text-muted-foreground ml-0.5">
                  VP
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      {notes && (
        <div className="rounded-lg border border-border bg-muted/10 p-3 space-y-1">
          <div className="flex items-center gap-1.5">
            <ScrollText className="w-3 h-3 text-muted-foreground" />
            <span className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">
              Game Notes
            </span>
          </div>
          <p className="text-[10px] font-body text-foreground/80 whitespace-pre-wrap">
            {notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default GameCompleteSummary;
