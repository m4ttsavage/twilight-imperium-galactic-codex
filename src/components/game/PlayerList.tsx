import { User, Crown, Clock, Check, Trophy, ScrollText } from "lucide-react";
import { TI4_FACTIONS } from "@/lib/factions";
import { STRATEGY_CARDS } from "@/lib/strategy-cards";

export interface GamePlayerInfo {
  id: string;
  player_user_id: string | null;
  nickname: string | null;
  faction_name: string | null;
  slice_index: number;
  strategy_card: number | null;
  draft_position: number | null;
  faction_locked: boolean;
  placement: number | null;
  victory_points: number | null;
}

interface Props {
  players: GamePlayerInfo[];
  hostId: string;
  currentUserId: string | null;
  gameStatus: string;
  currentTurnPlayerId?: string | null;
  playerCount: number;
  notes?: string | null;
}

const PlayerList = ({
  players,
  hostId,
  currentUserId,
  gameStatus,
  currentTurnPlayerId,
  playerCount,
}: Props) => {
  const emptySlots = Math.max(0, playerCount - players.length);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">
          Players
        </span>
        <span className="text-[9px] font-body text-muted-foreground">
          ({players.length}/{playerCount})
        </span>
      </div>

      {players.map((p) => {
        const isHost = p.player_user_id === hostId;
        const isCurrentUser = p.player_user_id === currentUserId;
        const isCurrentTurn = p.player_user_id === currentTurnPlayerId;
        const faction = p.faction_name
          ? TI4_FACTIONS.find((f) => f.name === p.faction_name)
          : null;
        const strategy = p.strategy_card
          ? STRATEGY_CARDS.find((s) => s.number === p.strategy_card)
          : null;

        return (
          <div
            key={p.id}
            className={`flex items-center gap-2 rounded-lg border p-2 transition-all ${
              isCurrentTurn
                ? "border-gold/40 bg-gold/10 ring-1 ring-gold/20"
                : isCurrentUser
                  ? "border-teal/30 bg-teal/5"
                  : "border-border bg-muted/10"
            }`}
          >
            {/* Avatar / faction icon */}
            {faction ? (
              <img
                src={faction.icon}
                alt={faction.shortName}
                className="w-6 h-6 rounded-md object-contain"
              />
            ) : (
              <div className="w-6 h-6 rounded-md bg-muted/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}

            {/* Name + info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-body text-foreground truncate">
                  {p.nickname || "Player"}
                </span>
                {isHost && <Crown className="w-3 h-3 text-gold flex-shrink-0" />}
                {isCurrentUser && (
                  <span className="text-[8px] font-display uppercase tracking-wider text-teal flex-shrink-0">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {faction && (
                  <span className="text-[9px] font-body text-muted-foreground truncate">
                    {faction.shortName}
                  </span>
                )}
                {strategy && (
                  <span
                    className="text-[8px] font-display uppercase tracking-wider px-1 py-0.5 rounded"
                    style={{
                      backgroundColor: `${strategy.color}20`,
                      color: strategy.color,
                    }}
                  >
                    {strategy.name}
                  </span>
                )}
              </div>
            </div>

            {/* Status indicator */}
            {gameStatus === "complete" && p.placement !== null && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`text-[9px] font-display uppercase tracking-wider px-1 py-0.5 rounded ${
                  p.placement === 1
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "bg-muted/20 text-muted-foreground border border-border"
                }`}>
                  {p.placement === 1 ? "1st" : p.placement === 2 ? "2nd" : p.placement === 3 ? "3rd" : `${p.placement}th`}
                </span>
                <span className="text-[8px] font-body text-muted-foreground">
                  {p.victory_points ?? 0}VP
                </span>
              </div>
            )}
            {gameStatus !== "complete" && isCurrentTurn && (
              <Clock className="w-3.5 h-3.5 text-gold animate-pulse flex-shrink-0" />
            )}
            {gameStatus !== "complete" && !isCurrentTurn && gameStatus === "faction_draft" && p.faction_locked && (
              <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
            )}
          </div>
        );
      })}

      {/* Empty slots */}
      {Array.from({ length: emptySlots }, (_, i) => (
        <div
          key={`empty-${i}`}
          className="flex items-center gap-2 rounded-lg border border-dashed border-border/50 p-2"
        >
          <div className="w-6 h-6 rounded-md bg-muted/10 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-muted-foreground/40" />
          </div>
          <span className="text-[10px] font-body text-muted-foreground/50 italic">
            Waiting for player…
          </span>
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
