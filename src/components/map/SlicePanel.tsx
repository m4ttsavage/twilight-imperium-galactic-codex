import { TI4_FACTIONS } from "@/lib/factions";
import { SLICE_COLORS, sliceLabel, type GeneratedMap } from "@/lib/map-data";

interface SlicePanelProps {
  map: GeneratedMap;
  sliceFactions: (string | null)[];
  sliceNicknames: string[];
  availableFactions: string[];
  onAssign: (sliceIndex: number, factionName: string | null) => void;
  onNickname: (sliceIndex: number, nickname: string) => void;
}

const SlicePanel = ({ map, sliceFactions, sliceNicknames, availableFactions, onAssign, onNickname }: SlicePanelProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
        Slice Assignments
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {map.sliceStats.map((stats, i) => {
          const faction = sliceFactions[i];
          const factionData = faction ? TI4_FACTIONS.find((f) => f.name === faction) : null;
          const color = factionData?.color || SLICE_COLORS[i % SLICE_COLORS.length];
          const nickname = sliceNicknames[i] || "";

          const options = availableFactions.filter(
            (f) => !sliceFactions.includes(f) || f === faction
          );

          return (
            <div
              key={i}
              className="rounded-lg border bg-card/60 p-2 flex flex-col gap-1.5"
              style={{ borderColor: color + "40" }}
            >
              {/* Header: badge + icon */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-display font-bold flex-shrink-0"
                  style={{ backgroundColor: color + "25", color }}
                >
                  {sliceLabel(i)}
                </div>
                {factionData && (
                  <img src={factionData.icon} alt={factionData.shortName} className="w-5 h-5 object-contain flex-shrink-0" />
                )}
                {/* Stats */}
                <div className="ml-auto flex items-center gap-1.5 text-[9px] font-body text-muted-foreground">
                  <span className="text-green-400 font-semibold">{stats.resources}</span>
                  <span className="text-muted-foreground/40">/</span>
                  <span className="text-blue-400 font-semibold">{stats.influence}</span>
                </div>
              </div>

              {/* Faction selector */}
              <select
                value={faction || ""}
                onChange={(e) => onAssign(i, e.target.value || null)}
                className="w-full text-[10px] font-body bg-muted/40 border border-border rounded px-1.5 py-1 text-foreground focus:outline-none focus:border-gold/40 truncate"
              >
                <option value="">Unassigned</option>
                {options.map((f) => (
                  <option key={f} value={f}>
                    {TI4_FACTIONS.find((ff) => ff.name === f)?.shortName || f}
                  </option>
                ))}
              </select>

              {/* Nickname */}
              {faction && (
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => onNickname(i, e.target.value)}
                  placeholder="Player…"
                  className="w-full text-[10px] font-body bg-muted/30 border border-border rounded px-1.5 py-1 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SlicePanel;
