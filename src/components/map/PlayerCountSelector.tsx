import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users } from "lucide-react";
import { getSupportedPlayerCounts } from "@/lib/map-data";

interface PlayerCountSelectorProps {
  value: number;
  onChange: (count: number) => void;
}

const PlayerCountSelector = ({ value, onChange }: PlayerCountSelectorProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-[10px] font-display uppercase tracking-wider">
          <Users className="w-3 h-3" />
          {value}P
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <p className="text-[9px] font-display uppercase tracking-wider text-muted-foreground mb-2">
          Player Count
        </p>
        <div className="flex gap-1">
          {getSupportedPlayerCounts().map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`text-[11px] px-3 py-1.5 rounded-lg font-body transition-colors ${
                value === n
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "bg-muted/30 text-muted-foreground border border-transparent hover:text-foreground"
              }`}
            >
              {n}p
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PlayerCountSelector;
