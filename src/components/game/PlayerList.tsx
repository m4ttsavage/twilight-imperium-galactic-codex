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

const placementLabel = (n: number) =>
  n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;

const PlayerList = ({
  players,
  hostId,
  currentUserId,
  gameStatus,
  currentTurnPlayerId,
  playerCount,
  notes,
}: Props) => {
  const emptySlots = Math.max(0, playerCount - players.length);
  const isComplete = gameStatus === "complete";

  const sortedPlayers = isComplete
    ? [...players].sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99))
    : players;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {isComplete && <Trophy className="w-3.5 h-3.5 text-gold" />}
        <span className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">
          {isComplete ? "Final Standings" : "Players"}
        </span>
        {!isComplete && (
          <span className="text-[9px] font-body text-muted-foreground">
            ({players.length}/{playerCount})
          </span>
        )}
      </div>

      {sortedPlayers.map((p) => {
        const isHost = p.player_user_id === hostId;
        const isCurrentUser = p.player_user_id === currentUserId;
        const isCurrentTurn = p.player_user_id === currentTurnPlayerId;
        const faction = p.faction_name
          ? TI4_FACTIONS.find((f) => f.name === p.faction_name)
          : null;
        const strategy = p.strategy_card
          ? STRATEGY_CARDS.find((s) => s.number === p.strategy_card)
          : null;
        const isWinner = isComplete && p.placement === 1;

        return (
          <div
            key={p.id}
            className={`flex items-center gap-2 rounded-lg border p-2 transition-all ${
              isWinner
                ? "border-gold/40 bg-gold/10"
                : isCurrentTurn
                  ? "border-gold/40 bg-gold/10 ring-1 ring-gold/20"
                  : isCurrentUser
                    ? "border-teal/30 bg-teal/5"
                    : "border-border bg-muted/10"
            }`}
          >
            {/* Placement badge (complete) or avatar/faction icon */}
            {isComplete && p.placement !== null ? (
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
                  placementLabel(p.placement)
                )}
              </div>
            ) : faction ? (
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

            {/* Faction icon (shown separately when complete, since placement takes the lead spot) */}
            {isComplete && faction && (
              <img
                src={faction.icon}
                alt={faction.shortName}
                className="w-5 h-5 rounded object-contain flex-shrink-0"
              />
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
                {!isComplete && strategy && (
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

            {/* VP (complete) or status indicators */}
            {isComplete && (
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
            )}
            {!isComplete && isCurrentTurn && (
              <Clock className="w-3.5 h-3.5 text-gold animate-pulse flex-shrink-0" />
            )}
            {!isComplete && !isCurrentTurn && gameStatus === "faction_draft" && p.faction_locked && (
              <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
            )}
          </div>
        );
      })}

      {/* Empty slots */}
      {!isComplete && Array.from({ length: emptySlots }, (_, i) => (
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

      {/* Game notes (complete only) */}
      {isComplete && notes && (
        <div className="rounded-lg border border-border bg-muted/10 p-3 space-y-1 mt-2">
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

export default PlayerList;
