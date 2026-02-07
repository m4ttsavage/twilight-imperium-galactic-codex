import { useState, useMemo, useCallback, useEffect } from "react";
import { Users } from "lucide-react";
import { TI4_FACTIONS } from "@/lib/factions";
import { STRATEGY_CARDS } from "@/lib/strategy-cards";
import FactionSearchSelect from "@/components/FactionSearchSelect";

export interface PlayerAssignment {
  name: string;
  email: string;
  factionName: string;
  sliceIndex: number;
  strategyCard: number;
}

export interface InitialPlayerData {
  factionName: string;
  playerName: string;
}

interface HostSetupPanelProps {
  playerCount: number;
  initialData?: InitialPlayerData[];
  onAssignmentsChange: (assignments: PlayerAssignment[], valid: boolean) => void;
}

const SLICE_LABELS = "ABCDEFGH".split("");

const HostSetupPanel = ({ playerCount, initialData, onAssignmentsChange }: HostSetupPanelProps) => {
  const [rows, setRows] = useState<PlayerAssignment[]>(() =>
    Array.from({ length: playerCount }, (_, i) => ({
      name: initialData?.[i]?.playerName || "",
      email: "",
      factionName: initialData?.[i]?.factionName || "",
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
          ...Array.from({ length: playerCount - prev.length }, (_, j) => {
            const idx = prev.length + j;
            return {
              name: initialData?.[idx]?.playerName || "",
              email: "",
              factionName: initialData?.[idx]?.factionName || "",
              sliceIndex: -1,
              strategyCard: -1,
            };
          }),
        ];
      }
      return prev.slice(0, playerCount);
    });
  }, [playerCount, initialData]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {rows.map((row, i) => (
          <PlayerCard
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

interface PlayerCardProps {
  index: number;
  row: PlayerAssignment;
  playerCount: number;
  usedFactions: string[];
  usedSlices: number[];
  usedStrategies: number[];
  onUpdate: (index: number, field: keyof PlayerAssignment, value: string | number) => void;
}

const PlayerCard = ({
  index,
  row,
  playerCount,
  usedFactions,
  usedSlices,
  usedStrategies,
  onUpdate,
}: PlayerCardProps) => {
  const sliceOptions = Array.from({ length: playerCount }, (_, i) => i);
  const factionData = row.factionName ? TI4_FACTIONS.find((f) => f.name === row.factionName) : null;

  return (
    <div className="rounded-lg border border-border bg-card/40 p-2.5 space-y-1.5">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">
          Player {index + 1}
        </span>
        {factionData && (
          <img src={factionData.icon} alt={factionData.shortName} className="w-4 h-4 object-contain ml-auto" />
        )}
      </div>

      {/* Name */}
      <input
        type="text"
        placeholder="Player name *"
        value={row.name}
        onChange={(e) => onUpdate(index, "name", e.target.value)}
        maxLength={50}
        className="w-full h-7 px-2 rounded bg-muted/30 border border-border text-xs font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40"
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email (optional)"
        value={row.email}
        onChange={(e) => onUpdate(index, "email", e.target.value)}
        maxLength={100}
        className="w-full h-7 px-2 rounded bg-muted/30 border border-border text-[11px] font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40"
      />

      {/* Faction select */}
      <FactionSearchSelect
        value={row.factionName}
        onChange={(val) => onUpdate(index, "factionName", val)}
        exclude={usedFactions.filter((f) => f !== row.factionName)}
        placeholder="Select Faction…"
        compact
      />

      {/* Slice + Strategy in a row */}
      <div className="flex gap-1.5">
        <select
          value={row.sliceIndex}
          onChange={(e) => onUpdate(index, "sliceIndex", parseInt(e.target.value, 10))}
          className="flex-1 h-7 px-2 rounded bg-card border border-border text-[11px] font-body text-foreground focus:outline-none focus:border-gold/40 appearance-none cursor-pointer
            [&>option]:bg-card [&>option]:text-foreground"
        >
          <option value={-1} className="text-muted-foreground">Slice…</option>
          {sliceOptions.map((s) => {
            const taken = usedSlices.includes(s) && row.sliceIndex !== s;
            return (
              <option key={s} value={s} disabled={taken}>
                Slice {SLICE_LABELS[s] || s}{taken ? " ✗" : ""}
              </option>
            );
          })}
        </select>

        <select
          value={row.strategyCard}
          onChange={(e) => onUpdate(index, "strategyCard", parseInt(e.target.value, 10))}
          className="flex-1 h-7 px-2 rounded bg-card border border-border text-[11px] font-body text-foreground focus:outline-none focus:border-gold/40 appearance-none cursor-pointer
            [&>option]:bg-card [&>option]:text-foreground"
        >
          <option value={-1} className="text-muted-foreground">Strategy…</option>
          {STRATEGY_CARDS.map((card) => {
            const taken = usedStrategies.includes(card.number) && row.strategyCard !== card.number;
            return (
              <option key={card.number} value={card.number} disabled={taken}>
                {card.number}. {card.name}{taken ? " ✗" : ""}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default HostSetupPanel;
