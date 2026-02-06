import { GeneratedMap, hexToPixel, hexPoints, sliceLabel, SLICE_COLORS } from "@/lib/map-data";
import { TI4_FACTIONS } from "@/lib/factions";
import HexTileGraphics from "./HexTileGraphics";

interface HexMapBoardProps {
  map: GeneratedMap;
  sliceFactions: (string | null)[];
  sliceNicknames?: string[];
  onHomeClick?: (sliceIndex: number) => void;
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

const HexMapBoard = ({ map, sliceFactions, sliceNicknames = [], onHomeClick }: HexMapBoardProps) => {
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
          fill = "#1a1018";
          stroke = "#3a2030";
        } else if (hex.tile.type === "empty") {
          fill = "#0d1018";
          stroke = "#1a2030";
        } else {
          fill = color + "10";
          stroke = color + "50";
        }

        const factionData = hex.isHome && sliceFactions[hex.sliceIndex]
          ? TI4_FACTIONS.find((f) => f.name === sliceFactions[hex.sliceIndex]!)
          : null;

        const nickname = hex.isHome ? (sliceNicknames[hex.sliceIndex] || "") : "";

        return (
          <g key={`${hex.q},${hex.r}`}>
            <polygon
              points={pts}
              fill={fill}
              stroke={stroke}
              strokeWidth={hex.isCenter ? 2 : hex.isHome ? 1.8 : 0.8}
              filter={hex.isCenter ? "url(#glow-gold)" : undefined}
              style={hex.isHome && onHomeClick ? { cursor: "pointer" } : undefined}
              onClick={hex.isHome && onHomeClick ? () => onHomeClick(hex.sliceIndex) : undefined}
            />

            {/* Slice letter badge */}
            {!hex.isCenter && hex.sliceIndex >= 0 && (
              <text
                x={x + HEX_SIZE * 0.55}
                y={y - HEX_SIZE * 0.45}
                textAnchor="middle"
                fill={color}
                fontSize={6}
                fontFamily="Orbitron"
                opacity={0.4}
              >
                {sliceLabel(hex.sliceIndex)}
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

            {/* Home system - no faction assigned */}
            {hex.isHome && !factionData && (
              <g
                style={onHomeClick ? { cursor: "pointer" } : undefined}
                onClick={onHomeClick ? () => onHomeClick(hex.sliceIndex) : undefined}
              >
                <text x={x} y={y - 4} textAnchor="middle" fill={stroke} fontSize={9} fontFamily="Orbitron" fontWeight={600} opacity={0.7}>
                  {sliceLabel(hex.sliceIndex)}
                </text>
                {onHomeClick && (
                  <text x={x} y={y + 7} textAnchor="middle" fill={stroke} fontSize={4} fontFamily="Rajdhani" opacity={0.35}>
                    click to assign
                  </text>
                )}
              </g>
            )}

            {/* Home system - faction assigned */}
            {hex.isHome && factionData && (
              <g
                style={onHomeClick ? { cursor: "pointer" } : undefined}
                onClick={onHomeClick ? () => onHomeClick(hex.sliceIndex) : undefined}
              >
                {/* Nickname above icon */}
                {nickname && (
                  <text
                    x={x}
                    y={y - 20}
                    textAnchor="middle"
                    fill={stroke}
                    fontSize={5.5}
                    fontFamily="Rajdhani"
                    fontWeight={600}
                    opacity={0.85}
                  >
                    {nickname}
                  </text>
                )}
                <image
                  href={factionData.icon}
                  x={x - 12}
                  y={nickname ? y - 12 : y - 14}
                  width={24}
                  height={24}
                  opacity={0.9}
                />
                <text x={x} y={y + (nickname ? 20 : 18)} textAnchor="middle" fill={stroke} fontSize={6} fontFamily="Orbitron" fontWeight={500}>
                  {factionData.shortName}
                </text>
              </g>
            )}

            {/* R/I stats badge on home hexes */}
            {hex.isHome && (() => {
              const stats = map.sliceStats[hex.sliceIndex];
              if (!stats) return null;
              const badgeY = y + HEX_SIZE * 0.78;
              return (
                <g>
                  <rect
                    x={x - 16}
                    y={badgeY - 5.5}
                    width={32}
                    height={11}
                    rx={3}
                    fill={color + "20"}
                    stroke={color + "40"}
                    strokeWidth={0.5}
                  />
                  <text
                    x={x - 3}
                    y={badgeY + 2}
                    textAnchor="end"
                    fontSize={6}
                    fontFamily="Rajdhani"
                    fontWeight={700}
                    fill="#4ade80"
                  >
                    {stats.resources}
                  </text>
                  <text
                    x={x}
                    y={badgeY + 2}
                    textAnchor="middle"
                    fontSize={5}
                    fontFamily="Rajdhani"
                    fill={color}
                    opacity={0.5}
                  >
                    /
                  </text>
                  <text
                    x={x + 3}
                    y={badgeY + 2}
                    textAnchor="start"
                    fontSize={6}
                    fontFamily="Rajdhani"
                    fontWeight={700}
                    fill="#60a5fa"
                  >
                    {stats.influence}
                  </text>
                </g>
              );
            })()}

            {/* Tile graphics (planets, anomalies, wormholes, empty) */}
            <HexTileGraphics
              tile={hex.tile}
              x={x}
              y={y}
              hexSize={HEX_SIZE}
              isCenter={hex.isCenter}
              isHome={hex.isHome}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default HexMapBoard;
