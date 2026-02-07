import { useState } from "react";
import { MapPin } from "lucide-react";
import DraftConfirmDialog from "./DraftConfirmDialog";

interface Props {
  draftOrder: number[];
  currentPickIndex: number;
  myDraftPosition: number | null;
  availableSlices: number[];
  playerCount: number;
  onSelect: (sliceIndex: number) => void;
  selections: Record<number, string>; // draftPosition -> playerName who picked
}

const SliceDraftPanel = ({
  draftOrder,
  currentPickIndex,
  myDraftPosition,
  availableSlices,
  playerCount,
  onSelect,
  selections,
}: Props) => {
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isMyTurn = myDraftPosition !== null && draftOrder[currentPickIndex] === myDraftPosition;
  const allPicked = currentPickIndex >= playerCount;

  const sliceLabels = Array.from({ length: playerCount }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  const handleConfirm = () => {
    if (selectedSlice !== null) {
      setConfirmOpen(false);
      onSelect(selectedSlice);
      setSelectedSlice(null);
    }
  };

  if (allPicked) {
    return (
      <div className="rounded-lg border border-teal/20 bg-teal/5 p-3">
        <p className="text-xs font-body text-teal">
          All slices have been assigned! Moving to strategy draft…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <span className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">
        Slice Draft — Pick #{currentPickIndex + 1} of {playerCount}
      </span>

      {/* Draft order display */}
      <div className="flex items-center gap-1 flex-wrap">
        {draftOrder.map((pos, idx) => (
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

      {isMyTurn ? (
        <>
          <p className="text-[10px] font-body text-gold">
            It's your turn! Select a starting slice:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: playerCount }, (_, i) => {
              const isAvailable = availableSlices.includes(i);
              const isSelected = selectedSlice === i;
              return (
                <button
                  key={i}
                  onClick={() => isAvailable && setSelectedSlice(i)}
                  disabled={!isAvailable}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-display uppercase tracking-wider transition-all ${
                    isSelected
                      ? "border-gold/40 bg-gold/15 text-gold ring-1 ring-gold/20"
                      : isAvailable
                        ? "border-border bg-muted/20 text-foreground hover:border-gold/20 hover:bg-gold/5"
                        : "border-border/30 bg-muted/5 text-muted-foreground/40 cursor-not-allowed"
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  Slice {sliceLabels[i]}
                </button>
              );
            })}
          </div>
          {selectedSlice !== null && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 transition-colors text-xs font-display uppercase tracking-wider"
            >
              Confirm Slice {sliceLabels[selectedSlice]}
            </button>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-border bg-muted/10 p-3">
          <p className="text-[10px] font-body text-muted-foreground">
            Waiting for Player {draftOrder[currentPickIndex] + 1} to pick their slice…
          </p>
        </div>
      )}

      <DraftConfirmDialog
        open={confirmOpen}
        title="Confirm Slice Selection"
        description={`Final answer — you're selecting Slice ${selectedSlice !== null ? sliceLabels[selectedSlice] : ""}. This can't be changed once the next player makes their selection.`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default SliceDraftPanel;
