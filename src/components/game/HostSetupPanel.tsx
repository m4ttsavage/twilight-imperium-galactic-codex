import { useState, useMemo, useCallback, useEffect } from "react";
import { Users } from "lucide-react";
import { TI4_FACTIONS } from "@/lib/factions";
import { STRATEGY_CARDS } from "@/lib/strategy-cards";

export interface PlayerAssignment {
  name: string;
  email: string;
  factionName: string;
  sliceIndex: number;
  strategyCard: number;
}

interface HostSetupPanelProps {
  playerCount: number;
  onAssignmentsChange: (assignments: PlayerAssignment[], valid: boolean) => void;
}

const SLICE_LABELS = "ABCDEFGH".split("");

const HostSetupPanel = ({ playerCount, onAssignmentsChange }: HostSetupPanelProps) => {
  const [rows, setRows] = useState<PlayerAssignment[]>(() =>
    Array.from({ length: playerCount }, () => ({
      name: "",
      email: "",
      factionName: "",
      sliceIndex: -1,
      strategyCard: -1,
    })),
  );

  // Sync row count when playerCount changes
  useEffect(() => {
    setRows((prev) => {
      if (prev.length === playerCount) return prev;
      if (prev.length < playerCount) {
        return [
          ...prev,
          ...Array.from({ length: playerCount - prev.length }, () => ({
            name: "",
            email: "",
            factionName: "",
            sliceIndex: -1,
            strategyCard: -1,
          })),
        ];
      }
      return prev.slice(0, playerCount);
    });
  }, [playerCount]);

  const validation = useMemo(() => {
    const names = rows.map((r) => r.name.trim());
    const factions = rows.map((r) => r.factionName);
    const slices = rows.map((r) => r.sliceIndex);
    const strategies = rows.map((r) => r.strategyCard);

    const allNamed = names.every((n) => n.length > 0);
    const allFactions = factions.every((f) => f.length > 0);
    const allSlices = slices.every((s) => s >= 0);
    const allStrategies = strategies.every((s) => s >= 0);

    const uniqueFactions = new Set(factions.filter((f) => f));
    const uniqueSlices = new Set(slices.filter((s) => s >= 0));
    const uniqueStrategies = new Set(strategies.filter((s) => s >= 0));

    const noDupFactions = uniqueFactions.size === factions.filter((f) => f).length;
    const noDupSlices = uniqueSlices.size === slices.filter((s) => s >= 0).length;
    const noDupStrategies = uniqueStrategies.size === strategies.filter((s) => s >= 0).length;

    return {
      valid: allNamed && allFactions && allSlices && allStrategies && noDupFactions && noDupSlices && noDupStrategies,
      dupFactions: !noDupFactions,
      dupSlices: !noDupSlices,
      dupStrategies: !noDupStrategies,
    };
  }, [rows]);

  // Notify parent on every change
  useEffect(() => {
    onAssignmentsChange(rows, validation.valid);
  }, [rows, validation.valid, onAssignmentsChange]);

  const updateRow = useCallback((index: number, field: keyof PlayerAssignment, value: string | number) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }, []);

  const usedFactions = rows.map((r) => r.factionName).filter(Boolean);
  const usedSlices = rows.map((r) => r.sliceIndex).filter((s) => s >= 0);
  const usedStrategies = rows.map((r) => r.strategyCard).filter((s) => s >= 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gold" />
        <h3 className="font-display text-xs tracking-widest uppercase text-foreground">
          Player Assignments
        </h3>
      </div>

      {validation.dupFactions && (
        <p className="text-[10px] text-destructive font-body">⚠ Duplicate factions selected</p>
      )}
      {validation.dupSlices && (
        <p className="text-[10px] text-destructive font-body">⚠ Duplicate slices selected</p>
      )}
      {validation.dupStrategies && (
        <p className="text-[10px] text-destructive font-body">⚠ Duplicate strategy cards selected</p>
      )}

      <div className="space-y-2">
        {rows.map((row, i) => (
          <PlayerRow
            key={i}
            index={i}
            row={row}
            playerCount={playerCount}
            usedFactions={usedFactions}
            usedSlices={usedSlices}
            usedStrategies={usedStrategies}
            onUpdate={updateRow}
          />
        ))}
      </div>
    </div>
  );
};

interface PlayerRowProps {
  index: number;
  row: PlayerAssignment;
  playerCount: number;
  usedFactions: string[];
  usedSlices: number[];
  usedStrategies: number[];
  onUpdate: (index: number, field: keyof PlayerAssignment, value: string | number) => void;
}

const PlayerRow = ({
  index,
  row,
  playerCount,
  usedFactions,
  usedSlices,
  usedStrategies,
  onUpdate,
}: PlayerRowProps) => {
  const sliceOptions = Array.from({ length: playerCount }, (_, i) => i);

  return (
    <div className="rounded-lg border border-border bg-card/40 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-display uppercase tracking-wider text-muted-foreground w-16 shrink-0">
          Player {index + 1}
        </span>
        <input
          type="text"
          placeholder="Name *"
          value={row.name}
          onChange={(e) => onUpdate(index, "name", e.target.value)}
          maxLength={50}
          className="flex-1 min-w-0 h-7 px-2 rounded bg-muted/30 border border-border text-xs font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={row.email}
          onChange={(e) => onUpdate(index, "email", e.target.value)}
          maxLength={100}
          className="flex-1 min-w-0 h-7 px-2 rounded bg-muted/30 border border-border text-xs font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Faction select */}
        <select
          value={row.factionName}
          onChange={(e) => onUpdate(index, "factionName", e.target.value)}
          className="h-7 px-2 rounded bg-muted/30 border border-border text-[10px] font-body text-foreground focus:outline-none focus:border-gold/40 min-w-[140px]"
        >
          <option value="">Select Faction…</option>
          {TI4_FACTIONS.map((f) => {
            const taken = usedFactions.includes(f.name) && row.factionName !== f.name;
            return (
              <option key={f.name} value={f.name} disabled={taken}>
                {f.shortName}{taken ? " (taken)" : ""}
              </option>
            );
          })}
        </select>

        {/* Slice select */}
        <select
          value={row.sliceIndex}
          onChange={(e) => onUpdate(index, "sliceIndex", parseInt(e.target.value, 10))}
          className="h-7 px-2 rounded bg-muted/30 border border-border text-[10px] font-body text-foreground focus:outline-none focus:border-gold/40 min-w-[100px]"
        >
          <option value={-1}>Select Slice…</option>
          {sliceOptions.map((s) => {
            const taken = usedSlices.includes(s) && row.sliceIndex !== s;
            return (
              <option key={s} value={s} disabled={taken}>
                Slice {SLICE_LABELS[s] || s}{taken ? " (taken)" : ""}
              </option>
            );
          })}
        </select>

        {/* Strategy card select */}
        <select
          value={row.strategyCard}
          onChange={(e) => onUpdate(index, "strategyCard", parseInt(e.target.value, 10))}
          className="h-7 px-2 rounded bg-muted/30 border border-border text-[10px] font-body text-foreground focus:outline-none focus:border-gold/40 min-w-[140px]"
        >
          <option value={-1}>Select Strategy…</option>
          {STRATEGY_CARDS.map((card) => {
            const taken = usedStrategies.includes(card.number) && row.strategyCard !== card.number;
            return (
              <option key={card.number} value={card.number} disabled={taken}>
                {card.number}. {card.name}{taken ? " (taken)" : ""}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default HostSetupPanel;
