import { useState } from "react";
import { Save, Trophy } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { exportMapString, type GeneratedMap } from "@/lib/map-data";
import { toast } from "sonner";

interface Props {
  map: GeneratedMap;
  sliceFactions: (string | null)[];
  sliceNicknames: string[];
}

interface PlayerResult {
  email: string;
  name: string;
  placement: string;
  victoryPoints: string;
}

const SaveGameDialog = ({ map, sliceFactions, sliceNicknames }: Props) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<PlayerResult[]>(
    () => Array.from({ length: map.playerCount }, (_, i) => ({
      email: "",
      name: sliceNicknames[i] || "",
      placement: "",
      victoryPoints: "",
    }))
  );

  if (!user) return null;

  const updateResult = (idx: number, field: keyof PlayerResult, value: string) => {
    setResults((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const allEmailsValid = results.every((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim()));

  const handleSave = async () => {
    if (!allEmailsValid) {
      toast.error("Please enter a valid email for each player");
      return;
    }
    setSaving(true);
    try {
      const mapString = exportMapString(map);

      const { data: game, error: gameError } = await supabase
        .from("games")
        .insert({
          user_id: user.id,
          map_string: mapString,
          player_count: map.playerCount,
          notes: notes || null,
        })
        .select("id")
        .single();

      if (gameError) throw gameError;

      const players = Array.from({ length: map.playerCount }, (_, i) => ({
        game_id: game.id,
        slice_index: i,
        faction_name: sliceFactions[i] || null,
        nickname: results[i].name || null,
        email: results[i].email || null,
        placement: results[i].placement ? parseInt(results[i].placement) : null,
        victory_points: results[i].victoryPoints ? parseInt(results[i].victoryPoints) : null,
      }));

      const { error: playersError } = await supabase
        .from("game_players")
        .insert(players);

      if (playersError) throw playersError;

      toast.success("Game saved!");
      setOpen(false);
      setNotes("");
      setResults(Array.from({ length: map.playerCount }, () => ({ email: "", name: "", placement: "", victoryPoints: "" })));
    } catch (err: any) {
      toast.error(err.message || "Failed to save game");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/10 border border-teal/30 text-teal hover:bg-teal/20 transition-colors text-[10px] font-display uppercase tracking-wider">
          <Save className="w-3 h-3" />
          Save Game
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-sm tracking-widest uppercase text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold" />
            Save Game Results
          </DialogTitle>
          <DialogDescription className="text-xs font-body text-muted-foreground">
            Record final standings for each player. The map layout and faction assignments will be saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {Array.from({ length: map.playerCount }, (_, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground w-14">
                  Slice {i + 1}
                </span>
                <span className="text-xs font-body text-foreground truncate flex-1">
                  {sliceFactions[i] || "Unassigned"}
                </span>
              </div>
              <div className="flex gap-3">
                <div className="flex-[2] space-y-1">
                  <Label className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">Email *</Label>
                  <Input
                    type="email"
                    placeholder="player@example.com"
                    value={results[i].email}
                    onChange={(e) => updateResult(i, "email", e.target.value)}
                    className="h-8 text-xs bg-muted/30 border-border"
                    required
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">Name</Label>
                  <Input
                    placeholder="Optional"
                    value={results[i].name}
                    onChange={(e) => updateResult(i, "name", e.target.value)}
                    className="h-8 text-xs bg-muted/30 border-border"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">Placement</Label>
                  <Input
                    type="number"
                    min="1"
                    max={map.playerCount}
                    placeholder="#"
                    value={results[i].placement}
                    onChange={(e) => updateResult(i, "placement", e.target.value)}
                    className="h-8 text-xs bg-muted/30 border-border"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">VP</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={results[i].victoryPoints}
                    onChange={(e) => updateResult(i, "victoryPoints", e.target.value)}
                    className="h-8 text-xs bg-muted/30 border-border"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-1">
            <Label className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this game..."
              className="text-xs bg-muted/30 border-border"
            />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={handleSave}
            disabled={saving || !allEmailsValid}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 transition-colors text-xs font-display uppercase tracking-wider disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving…" : "Save Game"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveGameDialog;
