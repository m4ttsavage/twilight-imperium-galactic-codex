import { format } from "date-fns";
import { Users, Trophy, ChevronDown, ChevronUp, ExternalLink, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import GameDetailView from "@/components/GameDetailView";
import GameCompleteSummary from "@/components/game/GameCompleteSummary";

interface GamePlayer {
  id: string;
  slice_index: number;
  faction_name: string | null;
  nickname: string | null;
  placement: number | null;
  victory_points: number | null;
}

interface Game {
  id: string;
  map_string: string;
  player_count: number;
  notes: string | null;
  played_at: string;
  created_at: string;
  name: string | null;
  game_players: GamePlayer[];
}

interface Props {
  game: Game;
  onViewMap: (mapString: string) => void;
}

const GameHistoryCard = ({ game, onViewMap }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const sortedPlayers = [...game.game_players].sort((a, b) => {
    if (a.placement && b.placement) return a.placement - b.placement;
    if (a.placement) return -1;
    if (b.placement) return 1;
    return a.slice_index - b.slice_index;
  });

  const winner = sortedPlayers.find((p) => p.placement === 1);

  return (
    <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-display uppercase tracking-wider text-foreground">
              {game.name || `${game.player_count}p Game`}
            </span>
            <span className="text-[10px] font-body text-muted-foreground">
              {format(new Date(game.played_at), "MMM d, yyyy")}
            </span>
          </div>
          {winner && (
            <div className="flex items-center gap-1 mt-0.5">
              <Trophy className="w-3 h-3 text-gold" />
              <span className="text-[10px] font-body text-gold truncate">
                {winner.faction_name || "Unknown"}{winner.nickname ? ` (${winner.nickname})` : ""}
                {winner.victory_points != null ? ` — ${winner.victory_points} VP` : ""}
              </span>
            </div>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border p-3 space-y-3">
          {/* Game Complete Summary (read-only standings) */}
          {sortedPlayers.some((p) => p.placement !== null) && (
            <GameCompleteSummary
              players={sortedPlayers.map((p) => ({
                id: p.id,
                player_user_id: null,
                nickname: p.nickname,
                faction_name: p.faction_name,
                slice_index: p.slice_index,
                strategy_card: null,
                draft_position: null,
                faction_locked: false,
                placement: p.placement,
                victory_points: p.victory_points,
              }))}
              notes={game.notes}
            />
          )}

          {/* Inline map */}
          <GameDetailView mapString={game.map_string} players={game.game_players} />

          <div className="flex items-center gap-2">
            <Link
              to={`/game/${game.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors text-[10px] font-display uppercase tracking-wider"
            >
              <Gamepad2 className="w-3 h-3" />
              View in Lobby
            </Link>
            <button
              onClick={() => onViewMap(game.map_string)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-[10px] font-display uppercase tracking-wider"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Generator
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHistoryCard;
