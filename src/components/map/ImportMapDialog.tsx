import { useState } from "react";
import { Import, X, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { parseMapString, type GeneratedMap } from "@/lib/map-data";

interface ImportMapDialogProps {
  onImport: (map: GeneratedMap) => void;
}

const EXAMPLE = "18 39 27 30 34 25 42 21 37 44 33 36 20 41 22 29 35 40 31 23 28 38 32 43 26 46 24 19 45 47 61 60";

const ImportMapDialog = ({ onImport }: ImportMapDialogProps) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleImport = () => {
    setError(null);
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a map string.");
      return;
    }
    try {
      const map = parseMapString(trimmed);
      onImport(map);
      setOpen(false);
      setInput("");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid map string.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(null); setShowHelp(false); } }}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:border-gold/30 transition-colors text-[10px] font-display uppercase tracking-wider">
          <Import className="w-3 h-3" />
          Import
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-sm tracking-widest uppercase text-foreground flex items-center gap-2">
            Import Map String
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        {showHelp && (
          <div className="rounded-lg bg-muted/30 border border-border p-3 text-[10px] font-body text-muted-foreground space-y-1.5">
            <p>
              Paste a <strong className="text-foreground">TI4 map string</strong> — a space-separated list of system tile IDs
              in spiral order from the center outward (rings 1 → 2 → 3).
            </p>
            <p>
              You can get these from tools like{" "}
              <a href="https://joepinion.github.io/ti4-map-lab/" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">
                TI4 Map Lab
              </a>
              . Home system positions are auto-detected (tile 0 or any unrecognized ID).
            </p>
            <p className="text-muted-foreground/60">
              Supports 6-player (36 tiles) and 3-player (18 tiles) layouts. Tile 18 = Mecatol Rex (always center).
            </p>
          </div>
        )}

        <div className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            placeholder="e.g. 18 39 27 30 34 25 42 ..."
            rows={4}
            className="w-full text-xs font-body bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 resize-none"
          />

          {error && (
            <p className="text-[10px] font-body text-destructive">{error}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setInput(EXAMPLE); setError(null); }}
              className="text-[9px] font-body text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Paste example
            </button>
            <div className="flex-1" />
            <button
              onClick={() => { setOpen(false); setInput(""); setError(null); }}
              className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors text-[10px] font-display uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors text-[10px] font-display uppercase tracking-wider"
            >
              Import Map
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportMapDialog;
