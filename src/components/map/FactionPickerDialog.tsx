import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TI4_FACTIONS } from "@/lib/factions";
import { sliceLabel } from "@/lib/map-data";

interface FactionPickerDialogProps {
  open: boolean;
  sliceIndex: number;
  currentFaction: string | null;
  assignedFactions: (string | null)[];
  onSelect: (factionName: string | null) => void;
  onClose: () => void;
}

const FactionPickerDialog = ({
  open,
  sliceIndex,
  currentFaction,
  assignedFactions,
  onSelect,
  onClose,
}: FactionPickerDialogProps) => {
  const availableFactions = TI4_FACTIONS.filter(
    (f) => !assignedFactions.includes(f.name) || f.name === currentFaction,
  );

  const handleSelect = (name: string | null) => {
    onSelect(name);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-sm tracking-widest uppercase">
            Assign Slice {sliceLabel(sliceIndex)}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
          {/* Unassign option */}
          <button
            onClick={() => handleSelect(null)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
              !currentFaction
                ? "border-gold/50 bg-gold/10"
                : "border-border hover:border-gold/30 hover:bg-muted/50"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
              —
            </div>
            <span className="text-[8px] text-muted-foreground">None</span>
          </button>
          {availableFactions.map((f) => (
            <button
              key={f.name}
              onClick={() => handleSelect(f.name)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                f.name === currentFaction
                  ? "border-gold/50 bg-gold/10"
                  : "border-border hover:border-gold/30 hover:bg-muted/50"
              }`}
            >
              <img
                src={f.icon}
                alt={f.shortName}
                className="w-8 h-8 object-contain"
              />
              <span className="text-[8px] text-foreground/80 truncate w-full text-center">
                {f.shortName}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FactionPickerDialog;
