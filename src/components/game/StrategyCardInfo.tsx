import { STRATEGY_CARDS, type StrategyCard } from "@/lib/strategy-cards";

interface Props {
  card: StrategyCard;
  selected?: boolean;
  disabled?: boolean;
  taken?: boolean;
  takenBy?: string;
  onClick?: () => void;
}

const StrategyCardInfo = ({ card, selected, disabled, taken, takenBy, onClick }: Props) => {
  const isClickable = onClick && !disabled && !taken;

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={disabled || taken}
      className={`w-full text-left rounded-lg border p-3 transition-all ${
        taken
          ? "border-border/50 bg-muted/10 opacity-50 cursor-not-allowed"
          : selected
            ? "border-gold/40 bg-gold/10 ring-1 ring-gold/20"
            : isClickable
              ? "border-border bg-card/40 hover:border-gold/20 hover:bg-gold/5 cursor-pointer"
              : "border-border bg-card/40 cursor-default"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-display font-bold text-white"
          style={{ backgroundColor: card.color }}
        >
          {card.number}
        </span>
        <span className="font-display text-xs tracking-wider uppercase text-foreground">
          {card.name}
        </span>
        {taken && takenBy && (
          <span className="ml-auto text-[9px] font-body text-muted-foreground italic">
            Taken by {takenBy}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-body text-foreground/80 leading-relaxed">
          <span className="text-gold font-medium">Primary:</span> {card.primary}
        </p>
        <p className="text-[10px] font-body text-muted-foreground leading-relaxed">
          <span className="text-teal font-medium">Secondary:</span> {card.secondary}
        </p>
      </div>
    </button>
  );
};

export default StrategyCardInfo;
