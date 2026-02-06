import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Scale } from "lucide-react";

interface BalanceDropdownProps {
  onBalance: (metric: "resources" | "influence" | "total") => void;
  disabled?: boolean;
}

const BalanceDropdown = ({ onBalance, disabled }: BalanceDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-[10px] font-display uppercase tracking-wider disabled:opacity-40"
      >
        <Scale className="w-3 h-3" />
        Balance
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-popover border-border z-50">
      <DropdownMenuItem
        onClick={() => onBalance("resources")}
        className="text-xs font-body cursor-pointer"
      >
        <span className="text-green-400 mr-1.5">R</span>
        Equalize Resources
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onBalance("influence")}
        className="text-xs font-body cursor-pointer"
      >
        <span className="text-blue-400 mr-1.5">I</span>
        Equalize Influence
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onBalance("total")}
        className="text-xs font-body cursor-pointer"
      >
        <span className="text-gold mr-1.5">⚖</span>
        Balance All
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default BalanceDropdown;
