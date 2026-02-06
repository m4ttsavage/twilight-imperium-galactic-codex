import { useMemo } from "react";
import { parseMapString, type GeneratedMap } from "@/lib/map-data";
import HexMapBoard from "@/components/map/HexMapBoard";
import { Map } from "lucide-react";

interface GamePlayer {
  id: string;
  slice_index: number;
  faction_name: string | null;
  nickname: string | null;
  placement: number | null;
  victory_points: number | null;
}

interface Props {
  mapString: string;
  players: GamePlayer[];
}

const GameDetailView = ({ mapString, players }: Props) => {
  const parsed = useMemo<GeneratedMap | null>(() => {
    try {
      return parseMapString(mapString);
    } catch {
      return null;
    }
  }, [mapString]);

  const sliceFactions = useMemo(() => {
    if (!parsed) return [];
    const factions: (string | null)[] = Array(parsed.playerCount).fill(null);
    players.forEach((p) => {
      if (p.slice_index >= 0 && p.slice_index < factions.length && p.faction_name) {
        factions[p.slice_index] = p.faction_name;
      }
    });
    return factions;
  }, [parsed, players]);

  if (!parsed) {
    return (
      <div className="rounded-lg border border-border bg-muted/10 p-4 text-center">
        <Map className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
        <p className="text-[10px] font-body text-muted-foreground">
          Unable to render map from saved data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">
        Board Layout
      </span>
      <div className="rounded-lg border border-border bg-card/30 p-1.5 overflow-hidden">
        <HexMapBoard map={parsed} sliceFactions={sliceFactions} />
      </div>
    </div>
  );
};

export default GameDetailView;
