import { useState } from "react";
import { STRATEGY_CARDS } from "@/lib/strategy-cards";
import StrategyCardInfo from "./StrategyCardInfo";
import DraftConfirmDialog from "./DraftConfirmDialog";

interface Props {
  strategyOrder: number[];
  currentPickIndex: number;
  myDraftPosition: number | null;
  takenCards: Record<number, string>; // card number -> player name
  playerCount: number;
  onSelect: (cardNumber: number) => void;
}

const StrategyDraftPanel = ({
  strategyOrder,
  currentPickIndex,
  myDraftPosition,
  takenCards,
  playerCount,
  onSelect,
}: Props) => {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isMyTurn = myDraftPosition !== null && strategyOrder[currentPickIndex] === myDraftPosition;
  const allPicked = currentPickIndex >= playerCount;

  const handleConfirm = () => {
    if (selectedCard !== null) {
      setConfirmOpen(false);
      onSelect(selectedCard);
      setSelectedCard(null);
    }
  };

  if (allPicked) {
    return (
      <div className="rounded-lg border border-teal/20 bg-teal/5 p-3">
        <p className="text-xs font-body text-teal">
          All strategy cards have been selected! The game is ready to begin. 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <span className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">
        Strategy Draft (Snake Order) — Pick #{currentPickIndex + 1} of {playerCount}
      </span>

      {/* Draft order display */}
      <div className="flex items-center gap-1 flex-wrap">
        {strategyOrder.map((pos, idx) => (
          <div
            key={idx}
            className={`px-2 py-1 rounded text-[9px] font-display uppercase tracking-wider ${
              idx === currentPickIndex
                ? "bg-gold/20 border border-gold/30 text-gold"
                : idx < currentPickIndex
                  ? "bg-muted/20 border border-border text-muted-foreground line-through"
                  : "bg-muted/10 border border-border/50 text-muted-foreground/60"
            }`}
          >
            P{pos + 1}
          </div>
        ))}
      </div>

      {isMyTurn && (
        <p className="text-[10px] font-body text-gold">
          It's your turn! Select a strategy card:
        </p>
      )}
      {!isMyTurn && !allPicked && (
        <div className="rounded-lg border border-border bg-muted/10 p-3">
          <p className="text-[10px] font-body text-muted-foreground">
            Waiting for Player {strategyOrder[currentPickIndex] + 1} to pick their strategy card…
          </p>
        </div>
      )}

      <div className="space-y-2">
        {STRATEGY_CARDS.map((card) => {
          const isTaken = card.number in takenCards;
          return (
            <StrategyCardInfo
              key={card.number}
              card={card}
              selected={selectedCard === card.number}
              disabled={!isMyTurn}
              taken={isTaken}
              takenBy={isTaken ? takenCards[card.number] : undefined}
              onClick={isMyTurn ? () => setSelectedCard(card.number) : undefined}
            />
          );
        })}
      </div>

      {isMyTurn && selectedCard !== null && (
        <button
          onClick={() => setConfirmOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 transition-colors text-xs font-display uppercase tracking-wider"
        >
          Confirm {STRATEGY_CARDS.find((c) => c.number === selectedCard)?.name}
        </button>
      )}

      <DraftConfirmDialog
        open={confirmOpen}
        title="Confirm Strategy Card"
        description={`Final answer — you're selecting ${STRATEGY_CARDS.find((c) => c.number === selectedCard)?.name || ""}. This can't be changed once the next player makes their selection.`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default StrategyDraftPanel;
