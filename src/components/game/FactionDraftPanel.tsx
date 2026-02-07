import { useState } from "react";
import { TI4_FACTIONS } from "@/lib/factions";
import { Lock } from "lucide-react";
import DraftConfirmDialog from "./DraftConfirmDialog";
import FactionSearchSelect from "@/components/FactionSearchSelect";

interface Props {
  onSubmit: (pref1: string, pref2: string, pref3: string) => void;
  locked: boolean;
  assignedFaction: string | null;
}

const FactionDraftPanel = ({ onSubmit, locked, assignedFaction }: Props) => {
  const [pref1, setPref1] = useState<string>("");
  const [pref2, setPref2] = useState<string>("");
  const [pref3, setPref3] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedFactions = [pref1, pref2, pref3].filter(Boolean);

  const getAvailableFactions = (exclude: string[]) =>
    TI4_FACTIONS.filter((f) => !exclude.includes(f.name));

  const canSubmit = pref1 && pref2 && pref3 && !locked;

  const handleLockIn = () => {
    if (canSubmit) setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    onSubmit(pref1, pref2, pref3);
  };

  if (locked && assignedFaction) {
    const faction = TI4_FACTIONS.find((f) => f.name === assignedFaction);
    return (
      <div className="space-y-3">
        <span className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">
          Your Faction
        </span>
        <div className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gold/5 p-3">
          {faction && (
            <img src={faction.icon} alt={faction.shortName} className="w-10 h-10 rounded-lg object-contain" />
          )}
          <div>
            <p className="text-sm font-display uppercase tracking-wider text-gold">
              {assignedFaction}
            </p>
            <p className="text-[10px] font-body text-muted-foreground">
              Assigned by ranked choice draft
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="rounded-lg border border-teal/20 bg-teal/5 p-3">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-teal" />
          <p className="text-xs font-body text-teal">
            Preferences locked in. Waiting for other players…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <span className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">
        Rank Your Top 3 Factions
      </span>
      <p className="text-[10px] font-body text-muted-foreground">
        Choose your 1st, 2nd, and 3rd preference. Ties are resolved by ranked-choice runoff.
      </p>

      {[
        { label: "1st Choice", value: pref1, setter: setPref1, exclude: [pref2, pref3] },
        { label: "2nd Choice", value: pref2, setter: setPref2, exclude: [pref1, pref3] },
        { label: "3rd Choice", value: pref3, setter: setPref3, exclude: [pref1, pref2] },
      ].map(({ label, value, setter, exclude }) => (
        <FactionSearchSelect
          key={label}
          label={label}
          value={value}
          onChange={setter}
          exclude={exclude.filter(Boolean)}
        />
      ))}

      <button
        onClick={handleLockIn}
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 transition-colors text-xs font-display uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Lock className="w-3.5 h-3.5" />
        Lock In Preferences
      </button>

      <DraftConfirmDialog
        open={confirmOpen}
        title="Lock In Faction Preferences"
        description="Final answer — once locked, your faction preferences cannot be changed. The system will resolve any ties using ranked-choice runoff."
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default FactionDraftPanel;
