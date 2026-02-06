import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "lucide-react";
import type { TileBank } from "@/lib/tile-database";

const BANK_LABELS: { id: TileBank; label: string }[] = [
  { id: "base", label: "Base Game" },
  { id: "pok", label: "Prophecy of Kings" },
  { id: "te", label: "Thunder's Edge" },
];

interface SystemBankSelectorProps {
  enabled: TileBank[];
  onChange: (banks: TileBank[]) => void;
}

const SystemBankSelector = ({ enabled, onChange }: SystemBankSelectorProps) => {
  const toggle = (bank: TileBank) => {
    if (enabled.includes(bank)) {
      if (enabled.length <= 1) return; // must keep at least one
      onChange(enabled.filter((b) => b !== bank));
    } else {
      onChange([...enabled, bank]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-[10px] font-display uppercase tracking-wider">
          <Database className="w-3 h-3" />
          System Bank
          <span className="text-gold/70 ml-0.5">({enabled.length})</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-3 bg-popover border-border z-50">
        <div className="space-y-3">
          <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
            Tile Sets
          </p>
          {BANK_LABELS.map((bank) => (
            <label
              key={bank.id}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Checkbox
                checked={enabled.includes(bank.id)}
                onCheckedChange={() => toggle(bank.id)}
              />
              <span className="text-xs font-body text-foreground/80 group-hover:text-foreground transition-colors">
                {bank.label}
              </span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SystemBankSelector;
