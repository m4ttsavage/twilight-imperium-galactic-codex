import { GeneratedMap, hexToPixel, hexPoints, SLICE_COLORS } from "@/lib/map-data";
import { TI4_FACTIONS } from "@/lib/factions";

interface HexMapBoardProps {
  map: GeneratedMap;
  sliceFactions: (string | null)[];
}

const HEX_SIZE = 38;

function getSliceColor(sliceIndex: number, sliceFactions: (string | null)[]): string {
  const faction = sliceFactions[sliceIndex];
  if (faction) {
    const f = TI4_FACTIONS.find((ff) => ff.name === faction);
    if (f) return f.color;
  }
  return SLICE_COLORS[sliceIndex % SLICE_COLORS.length];
}

const HexMapBoard = ({ map, sliceFactions }: HexMapBoardProps) => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  map.hexes.forEach((h) => {
    const { x, y } = hexToPixel(h.q, h.r, HEX_SIZE);
    minX = Math.min(minX, x - HEX_SIZE);
    maxX = Math.max(maxX, x + HEX_SIZE);
    minY = Math.min(minY, y - HEX_SIZE);
    maxY = Math.max(maxY, y + HEX_SIZE);
  });

  const pad = 12;
  const vb = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;

  return (
    <svg viewBox={vb} className="w-full h-auto" style={{ maxHeight: "70vh" }}>
      <defs>
        <filter id="glow-gold">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {map.hexes.map((hex) => {
        const { x, y } = hexToPixel(hex.q, hex.r, HEX_SIZE);
        const pts = hexPoints(x, y, HEX_SIZE - 1);
        const color = hex.sliceIndex >= 0 ? getSliceColor(hex.sliceIndex, sliceFactions) : "#d4a843";

        let fill: string;
        let stroke: string;

        if (hex.isCenter) {
          fill = "#2a2510";
          stroke = "#d4a843";
        } else if (hex.isHome) {
          fill = color + "30";
          stroke = color;
        } else if (hex.tile.type === "anomaly") {
          fill = "#2a1520";
          stroke = "#5a2535";
        } else if (hex.tile.type === "empty") {
          fill = "#151820";
          stroke = "#2a3040";
        } else {
          fill = color + "18";
          stroke = color + "70";
        }

        const factionData = hex.isHome && sliceFactions[hex.sliceIndex]
          ? TI4_FACTIONS.find((f) => f.name === sliceFactions[hex.sliceIndex]!)
          : null;

        return (
          <g key={`${hex.q},${hex.r}`}>
            <polygon
              points={pts}
              fill={fill}
              stroke={stroke}
              strokeWidth={hex.isCenter ? 2 : hex.isHome ? 1.8 : 1}
              filter={hex.isCenter ? "url(#glow-gold)" : undefined}
            />

            {/* Slice index badge */}
            {!hex.isCenter && hex.sliceIndex >= 0 && (
              <text
                x={x + HEX_SIZE * 0.55}
                y={y - HEX_SIZE * 0.45}
                textAnchor="middle"
                fill={color}
                fontSize={6}
                fontFamily="Orbitron"
                opacity={0.5}
              >
                {hex.sliceIndex + 1}
              </text>
            )}

            {/* Mecatol Rex */}
            {hex.isCenter && (
              <>
                <text x={x} y={y - 6} textAnchor="middle" fill="#d4a843" fontSize={7} fontFamily="Orbitron" fontWeight={600}>
                  MECATOL
                </text>
                <text x={x} y={y + 4} textAnchor="middle" fill="#d4a843" fontSize={6} fontFamily="Orbitron">
                  REX
                </text>
                <text x={x} y={y + 16} textAnchor="middle" fill="#d4a843" fontSize={9} fontFamily="Rajdhani" fontWeight={600}>
                  {hex.tile.resources}/{hex.tile.influence}
                </text>
              </>
            )}

            {/* Home system */}
            {hex.isHome && !factionData && (
              <text x={x} y={y + 3} textAnchor="middle" fill={stroke} fontSize={7} fontFamily="Orbitron" fontWeight={500}>
                HOME
              </text>
            )}
            {hex.isHome && factionData && (
              <>
                <image
                  href={factionData.icon}
                  x={x - 12}
                  y={y - 14}
                  width={24}
                  height={24}
                  opacity={0.9}
                />
                <text x={x} y={y + 18} textAnchor="middle" fill={stroke} fontSize={6} fontFamily="Orbitron" fontWeight={500}>
                  {factionData.shortName}
                </text>
              </>
            )}

            {/* Planet tiles */}
            {!hex.isCenter && !hex.isHome && hex.tile.type === "planet" && (
              <>
                <text x={x} y={y - 5} textAnchor="middle" fill="#8899aa" fontSize={5.5} fontFamily="Rajdhani" opacity={0.7}>
                  {hex.tile.name.length > 14 ? hex.tile.name.slice(0, 14) + "…" : hex.tile.name}
                </text>
                <text x={x} y={y + 10} textAnchor="middle" fill="#ccd0dd" fontSize={11} fontFamily="Rajdhani" fontWeight={600}>
                  {hex.tile.resources}/{hex.tile.influence}
                </text>
                {hex.tile.wormhole && (
                  <text x={x} y={y + 20} textAnchor="middle" fill="#7788cc" fontSize={6} fontFamily="Rajdhani">
                    ⊛ {hex.tile.wormhole}
                  </text>
                )}
              </>
            )}

            {/* Anomaly tiles */}
            {!hex.isCenter && !hex.isHome && hex.tile.type === "anomaly" && (
              <text x={x} y={y + 3} textAnchor="middle" fill="#bb4455" fontSize={6} fontFamily="Rajdhani" fontWeight={500}>
                {hex.tile.anomaly === "gravity-rift" ? "Gravity Rift" : hex.tile.anomaly === "asteroid" ? "Asteroids" : hex.tile.anomaly}
              </text>
            )}

            {/* Empty with wormhole */}
            {!hex.isCenter && !hex.isHome && hex.tile.type === "empty" && hex.tile.wormhole && (
              <text x={x} y={y + 3} textAnchor="middle" fill="#7788cc" fontSize={7} fontFamily="Rajdhani">
                ⊛ {hex.tile.wormhole}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default HexMapBoard;
