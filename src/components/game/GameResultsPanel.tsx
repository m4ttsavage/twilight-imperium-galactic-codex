import { useState } from "react";
import { Trophy } from "lucide-react";
import { TI4_FACTIONS } from "@/lib/factions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { GamePlayerInfo } from "./PlayerList";

interface PlayerResult {
  playerId: string;
  placement: number | null;
  victoryPoints: number | null;
}

interface Props {
  players: GamePlayerInfo[];
  onSubmit: (results: PlayerResult[], notes: string) => void;
}

const GameResultsPanel = ({ players, onSubmit }: Props) => {
  const [results, setResults] = useState<PlayerResult[]>(
    players.map((p) => ({
      playerId: p.id,
      placement: null,
      victoryPoints: null,
    }))
  );
  const [notes, setNotes] = useState("");

  const updatePlacement = (playerId: string, placement: number | null) => {
    setResults((prev) =>
      prev.map((r) => (r.playerId === playerId ? { ...r, placement } : r))
    );
  };

  const updateVP = (playerId: string, vp: number | null) => {
    setResults((prev) =>
      prev.map((r) => (r.playerId === playerId ? { ...r, victoryPoints: vp } : r))
    );
  };

  const allPlacementsSet = results.every((r) => r.placement !== null);
  const allVPSet = results.every((r) => r.victoryPoints !== null);
  const isValid = allPlacementsSet && allVPSet;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(results, notes);
  };

  return (
    <div className="rounded-lg border border-gold/20 bg-gold/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-gold" />
        <h3 className="font-display text-xs tracking-widest uppercase text-gold">
          Complete Game
        </h3>
      </div>

      <p className="text-[10px] font-body text-muted-foreground">
        Enter each player's final placement and victory points to record the
        game results.
      </p>

      <div className="space-y-3">
        {players.map((p) => {
          const faction = p.faction_name
            ? TI4_FACTIONS.find((f) => f.name === p.faction_name)
            : null;
          const result = results.find((r) => r.playerId === p.id);

          return (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/10 p-2"
            >
              {/* Player info */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {faction ? (
                  <img
                    src={faction.icon}
                    alt={faction.shortName}
                    className="w-5 h-5 rounded object-contain flex-shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded bg-muted/30 flex-shrink-0" />
                )}
                <span className="text-[10px] font-body text-foreground truncate">
                  {p.nickname || "Player"}
                </span>
              </div>

              {/* Placement select */}
              <Select
                value={result?.placement?.toString() || ""}
                onValueChange={(v) => updatePlacement(p.id, parseInt(v))}
              >
                <SelectTrigger className="w-[72px] h-7 text-[10px] font-display uppercase tracking-wider bg-background/50 border-border">
                  <SelectValue placeholder="Place" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: players.length }, (_, i) => i + 1).map(
                    (n) => (
                      <SelectItem key={n} value={n.toString()} className="text-[10px]">
                        {n === 1
                          ? "1st"
                          : n === 2
                            ? "2nd"
                            : n === 3
                              ? "3rd"
                              : `${n}th`}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              {/* VP input */}
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={99}
                  placeholder="VP"
                  value={result?.victoryPoints ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateVP(p.id, val === "" ? null : Math.max(0, Math.min(99, parseInt(val) || 0)));
                  }}
                  className="w-14 h-7 text-[10px] text-center font-body bg-background/50 border-border"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">
          Game Notes (optional)
        </Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any memorable moments, house rules used, etc."
          className="min-h-[60px] text-[10px] font-body bg-background/50 border-border resize-none"
        />
      </div>

      {/* Submit with confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            disabled={!isValid}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 transition-colors text-xs font-display uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trophy className="w-3.5 h-3.5" />
            Finalize Results
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-sm tracking-widest uppercase text-foreground">
              Finalize Game Results?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-body text-muted-foreground">
              This will permanently record the placements and victory points for
              all players. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-display uppercase tracking-wider bg-muted/30 border-border text-muted-foreground hover:text-foreground">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className="text-xs font-display uppercase tracking-wider bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30"
            >
              Yes, Finalize
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GameResultsPanel;
