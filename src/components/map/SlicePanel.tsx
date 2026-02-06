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
      {map.sliceStats.map((stats, i) => {
        const faction = sliceFactions[i];
        const factionData = faction ? TI4_FACTIONS.find((f) => f.name === faction) : null;
        const color = factionData?.color || SLICE_COLORS[i % SLICE_COLORS.length];
        const nickname = sliceNicknames[i] || "";

        // Factions available for this slot = unassigned ones + currently assigned one
        const options = availableFactions.filter(
          (f) => !sliceFactions.includes(f) || f === faction
        );

        return (
          <div
            key={i}
            className="rounded-lg border bg-card/60 p-3 flex flex-col gap-2"
            style={{ borderColor: color + "40" }}
          >
            <div className="flex items-center gap-2">
              {/* Slice badge */}
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-display font-bold flex-shrink-0"
                style={{ backgroundColor: color + "25", color }}
              >
                {sliceLabel(i)}
              </div>

              {/* Faction selector */}
              <select
                value={faction || ""}
                onChange={(e) => onAssign(i, e.target.value || null)}
                className="flex-1 text-xs font-body bg-muted/40 border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:border-gold/40"
              >
                <option value="">Unassigned</option>
                {options.map((f) => (
                  <option key={f} value={f}>
                    {TI4_FACTIONS.find((ff) => ff.name === f)?.shortName || f}
                  </option>
                ))}
              </select>

              {/* Faction icon */}
              {factionData && (
                <img src={factionData.icon} alt={factionData.shortName} className="w-6 h-6 object-contain flex-shrink-0" />
              )}
            </div>

            {/* Nickname */}
            {faction && (
              <input
                type="text"
                value={nickname}
                onChange={(e) => onNickname(i, e.target.value)}
                placeholder="Player name…"
                className="text-[11px] font-body bg-muted/30 border border-border rounded-md px-2 py-1 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40"
              />
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-[10px] font-body text-muted-foreground">
              <span>
                <span className="text-green-400 font-semibold">{stats.resources}</span> R
              </span>
              <span>
                <span className="text-blue-400 font-semibold">{stats.influence}</span> I
              </span>
              <span className="text-muted-foreground/50">
                {stats.tileCount} tiles
              </span>
              {nickname && (
                <span className="ml-auto text-foreground/60 italic truncate max-w-[100px]">
                  [{nickname}]
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SlicePanel;
