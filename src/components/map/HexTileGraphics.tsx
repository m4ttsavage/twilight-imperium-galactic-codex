import type { SystemTile, PlanetInfo, TechSpecialty } from "@/lib/map-data";

interface HexTileGraphicsProps {
  tile: SystemTile;
  x: number;
  y: number;
  hexSize: number;
  isCenter: boolean;
  isHome: boolean;
  homeTile?: SystemTile;
}

// ── Tech specialty → color ──────────────────────────────────────

function techColor(tech?: TechSpecialty): string {
  switch (tech) {
    case "biotic": return "#22c55e";
    case "warfare": return "#ef4444";
    case "propulsion": return "#3b82f6";
    case "cybernetic": return "#eab308";
    default: return "#94a3b8";
  }
}

function techGlow(tech?: TechSpecialty): string {
  switch (tech) {
    case "biotic": return "#22c55e40";
    case "warfare": return "#ef444440";
    case "propulsion": return "#3b82f640";
    case "cybernetic": return "#eab30840";
    default: return "#94a3b820";
  }
}

// ── Planet graphic ──────────────────────────────────────────────

function PlanetGraphic({ x, y, radius, tech }: { x: number; y: number; radius: number; tech?: TechSpecialty }) {
  const color = techColor(tech);
  const glow = techGlow(tech);
  return (
    <g>
      <circle cx={x} cy={y} r={radius + 2} fill={glow} />
      <circle cx={x} cy={y} r={radius} fill={color} opacity={0.85} />
      <circle cx={x} cy={y} r={radius * 0.6} fill="none" stroke="#ffffff20" strokeWidth={0.5} />
      {/* Highlight crescent */}
      <ellipse cx={x - radius * 0.15} cy={y - radius * 0.15} rx={radius * 0.7} ry={radius * 0.8} fill="#ffffff10" />
    </g>
  );
}

// ── Single-planet tile ──────────────────────────────────────────

function SinglePlanetContent({ x, y, tile }: { x: number; y: number; tile: SystemTile }) {
  return (
    <g>
      <PlanetGraphic x={x} y={y - 4} radius={7} tech={tile.tech} />
      <text x={x} y={y + 10} textAnchor="middle" fill="#ccd0dd" fontSize={5} fontFamily="Rajdhani" opacity={0.8}>
        {tile.name.length > 14 ? tile.name.slice(0, 14) + "…" : tile.name}
      </text>
      <text x={x} y={y + 17} textAnchor="middle" fill="#ccd0dd" fontSize={9} fontFamily="Rajdhani" fontWeight={600}>
        {tile.resources}/{tile.influence}
      </text>
      {tile.wormhole && <WormholeLabel x={x} y={y + 25} wormhole={tile.wormhole} />}
      {tile.tech && <TechBadge x={x + 14} y={y - 12} tech={tile.tech} />}
    </g>
  );
}

// ── Multi-planet tile (2 planets) ───────────────────────────────

function TwoPlanetContent({ x, y, planets }: { x: number; y: number; planets: PlanetInfo[] }) {
  return (
    <g>
      <PlanetGraphic x={x - 8} y={y - 8} radius={5} tech={planets[0].tech} />
      <text x={x + 3} y={y - 9} textAnchor="start" fill="#8899aa" fontSize={4} fontFamily="Rajdhani" opacity={0.7}>
        {planets[0].name.length > 10 ? planets[0].name.slice(0, 10) + "…" : planets[0].name}
      </text>
      <text x={x + 3} y={y - 3} textAnchor="start" fill="#ccd0dd" fontSize={7} fontFamily="Rajdhani" fontWeight={600}>
        {planets[0].resources}/{planets[0].influence}
      </text>
      {planets[0].tech && <TechBadge x={x - 14} y={y - 14} tech={planets[0].tech} size={3} />}

      <PlanetGraphic x={x - 8} y={y + 10} radius={5} tech={planets[1].tech} />
      <text x={x + 3} y={y + 9} textAnchor="start" fill="#8899aa" fontSize={4} fontFamily="Rajdhani" opacity={0.7}>
        {planets[1].name.length > 10 ? planets[1].name.slice(0, 10) + "…" : planets[1].name}
      </text>
      <text x={x + 3} y={y + 15} textAnchor="start" fill="#ccd0dd" fontSize={7} fontFamily="Rajdhani" fontWeight={600}>
        {planets[1].resources}/{planets[1].influence}
      </text>
      {planets[1].tech && <TechBadge x={x - 14} y={y + 4} tech={planets[1].tech} size={3} />}
    </g>
  );
}

// ── Multi-planet tile (3 planets) ───────────────────────────────

function ThreePlanetContent({ x, y, planets }: { x: number; y: number; planets: PlanetInfo[] }) {
  const offsets = [-14, 0, 14];
  return (
    <g>
      {planets.map((p, i) => (
        <g key={i}>
          <PlanetGraphic x={x - 10} y={y + offsets[i]} radius={4} tech={p.tech} />
          <text x={x + 1} y={y + offsets[i] - 1} textAnchor="start" fill="#8899aa" fontSize={3.5} fontFamily="Rajdhani" opacity={0.7}>
            {p.name.length > 9 ? p.name.slice(0, 9) + "…" : p.name}
          </text>
          <text x={x + 1} y={y + offsets[i] + 5} textAnchor="start" fill="#ccd0dd" fontSize={6} fontFamily="Rajdhani" fontWeight={600}>
            {p.resources}/{p.influence}
          </text>
          {p.tech && <TechBadge x={x - 16} y={y + offsets[i] - 5} tech={p.tech} size={2.5} />}
        </g>
      ))}
    </g>
  );
}

// ── Anomaly graphics ────────────────────────────────────────────

function AsteroidGraphic({ x, y, size }: { x: number; y: number; size: number }) {
  const s = size;
  return (
    <g>
      {/* Multiple asteroid rocks */}
      <polygon points={`${x - s * 0.6},${y - s * 0.2} ${x - s * 0.3},${y - s * 0.6} ${x + s * 0.1},${y - s * 0.5} ${x + s * 0.3},${y - s * 0.7} ${x + s * 0.5},${y - s * 0.3} ${x + s * 0.2},${y} ${x - s * 0.1},${y + s * 0.1} ${x - s * 0.5},${y}`}
        fill="#6b5a4e" stroke="#8b7a6e" strokeWidth={0.5} />
      <polygon points={`${x + s * 0.2},${y + s * 0.1} ${x + s * 0.5},${y} ${x + s * 0.7},${y + s * 0.3} ${x + s * 0.4},${y + s * 0.5} ${x + s * 0.1},${y + s * 0.4}`}
        fill="#5a4a3e" stroke="#7a6a5e" strokeWidth={0.5} />
      <polygon points={`${x - s * 0.7},${y + s * 0.3} ${x - s * 0.4},${y + s * 0.2} ${x - s * 0.3},${y + s * 0.5} ${x - s * 0.6},${y + s * 0.6}`}
        fill="#7b6b5e" stroke="#9b8b7e" strokeWidth={0.5} />
      {/* Tiny debris */}
      <circle cx={x - s * 0.2} cy={y - s * 0.3} r={1} fill="#8b7a6e" />
      <circle cx={x + s * 0.6} cy={y - s * 0.1} r={0.8} fill="#7a6a5e" />
    </g>
  );
}

function SupernovaGraphic({ x, y, size }: { x: number; y: number; size: number }) {
  const s = size;
  const rays = 8;
  const points: string[] = [];
  for (let i = 0; i < rays * 2; i++) {
    const angle = (i * Math.PI) / rays - Math.PI / 2;
    const r = i % 2 === 0 ? s * 0.8 : s * 0.35;
    points.push(`${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`);
  }
  return (
    <g>
      <circle cx={x} cy={y} r={s * 0.9} fill="#ff440015" />
      <circle cx={x} cy={y} r={s * 0.6} fill="#ff660020" />
      <polygon points={points.join(" ")} fill="#ff6600" opacity={0.7} stroke="#ffaa00" strokeWidth={0.5} />
      <circle cx={x} cy={y} r={s * 0.2} fill="#ffffcc" opacity={0.9} />
      <circle cx={x} cy={y} r={s * 0.12} fill="#ffffff" opacity={0.8} />
    </g>
  );
}

function GravityRiftGraphic({ x, y, size }: { x: number; y: number; size: number }) {
  const s = size;
  return (
    <g>
      {/* Swirling vortex rings */}
      <ellipse cx={x} cy={y} rx={s * 0.7} ry={s * 0.25} fill="none" stroke="#9966ff" strokeWidth={0.8} opacity={0.5} transform={`rotate(-20,${x},${y})`} />
      <ellipse cx={x} cy={y} rx={s * 0.5} ry={s * 0.18} fill="none" stroke="#bb88ff" strokeWidth={0.8} opacity={0.7} transform={`rotate(10,${x},${y})`} />
      <ellipse cx={x} cy={y} rx={s * 0.3} ry={s * 0.12} fill="none" stroke="#ddaaff" strokeWidth={0.8} opacity={0.9} transform={`rotate(-35,${x},${y})`} />
      {/* Center distortion */}
      <circle cx={x} cy={y} r={s * 0.15} fill="#6633cc" opacity={0.6} />
      <circle cx={x} cy={y} r={s * 0.08} fill="#aa77ff" opacity={0.8} />
      {/* Warped space lines */}
      <path d={`M${x - s * 0.6},${y - s * 0.4} Q${x},${y + s * 0.2} ${x + s * 0.6},${y - s * 0.4}`} fill="none" stroke="#7744cc40" strokeWidth={0.5} />
      <path d={`M${x - s * 0.5},${y + s * 0.4} Q${x},${y - s * 0.2} ${x + s * 0.5},${y + s * 0.4}`} fill="none" stroke="#7744cc40" strokeWidth={0.5} />
    </g>
  );
}

function NebulaGraphic({ x, y, size }: { x: number; y: number; size: number }) {
  const s = size;
  return (
    <g>
      {/* Nebula cloud layers */}
      <ellipse cx={x - s * 0.15} cy={y - s * 0.1} rx={s * 0.6} ry={s * 0.4} fill="#ff66aa15" />
      <ellipse cx={x + s * 0.1} cy={y + s * 0.05} rx={s * 0.5} ry={s * 0.35} fill="#ff44cc15" />
      <ellipse cx={x} cy={y} rx={s * 0.45} ry={s * 0.3} fill="#cc44aa20" />
      <ellipse cx={x - s * 0.1} cy={y} rx={s * 0.3} ry={s * 0.2} fill="#ff66cc25" />
      {/* Stars within nebula */}
      <circle cx={x - s * 0.2} cy={y - s * 0.15} r={0.8} fill="#ffccee" opacity={0.8} />
      <circle cx={x + s * 0.25} cy={y + s * 0.1} r={0.6} fill="#ffccee" opacity={0.6} />
      <circle cx={x + s * 0.05} cy={y - s * 0.25} r={0.5} fill="#ffddee" opacity={0.5} />
    </g>
  );
}

function EntropicScarGraphic({ x, y, size }: { x: number; y: number; size: number }) {
  const s = size;
  return (
    <g>
      {/* Jagged tear in space */}
      <path
        d={`M${x - s * 0.5},${y - s * 0.3} L${x - s * 0.2},${y - s * 0.1} L${x - s * 0.35},${y + s * 0.1} L${x},${y} L${x + s * 0.1},${y + s * 0.25} L${x + s * 0.3},${y + s * 0.05} L${x + s * 0.5},${y + s * 0.3}`}
        fill="none" stroke="#00ffcc" strokeWidth={1.2} opacity={0.7}
      />
      <path
        d={`M${x - s * 0.5},${y - s * 0.3} L${x - s * 0.2},${y - s * 0.1} L${x - s * 0.35},${y + s * 0.1} L${x},${y} L${x + s * 0.1},${y + s * 0.25} L${x + s * 0.3},${y + s * 0.05} L${x + s * 0.5},${y + s * 0.3}`}
        fill="none" stroke="#00ffcc40" strokeWidth={3} opacity={0.4}
      />
      {/* Energy crackle */}
      <circle cx={x} cy={y} r={s * 0.05} fill="#00ffcc" opacity={0.9} />
      <circle cx={x - s * 0.2} cy={y - s * 0.1} r={s * 0.03} fill="#00ffcc" opacity={0.7} />
      <circle cx={x + s * 0.3} cy={y + s * 0.05} r={s * 0.04} fill="#00ffcc" opacity={0.7} />
    </g>
  );
}

function WormholeGraphic({ x, y, size, type }: { x: number; y: number; size: number; type: string }) {
  const s = size;
  const color = type === "α" ? "#6699ff" : "#ff9944";
  const colorFaint = type === "α" ? "#6699ff20" : "#ff994420";
  return (
    <g>
      {/* Swirling portal */}
      <circle cx={x} cy={y} r={s * 0.6} fill={colorFaint} />
      <circle cx={x} cy={y} r={s * 0.4} fill="none" stroke={color} strokeWidth={0.8} opacity={0.6} />
      <ellipse cx={x} cy={y} rx={s * 0.35} ry={s * 0.15} fill="none" stroke={color} strokeWidth={0.6} opacity={0.5} transform={`rotate(45,${x},${y})`} />
      <ellipse cx={x} cy={y} rx={s * 0.35} ry={s * 0.15} fill="none" stroke={color} strokeWidth={0.6} opacity={0.5} transform={`rotate(-45,${x},${y})`} />
      <circle cx={x} cy={y} r={s * 0.15} fill={color} opacity={0.4} />
      <circle cx={x} cy={y} r={s * 0.06} fill="#ffffff" opacity={0.7} />
    </g>
  );
}

// ── Wormhole label ──────────────────────────────────────────────

function WormholeLabel({ x, y, wormhole }: { x: number; y: number; wormhole: string }) {
  const color = wormhole === "α" ? "#6699ff" : "#ff9944";
  return (
    <text x={x} y={y} textAnchor="middle" fill={color} fontSize={6} fontFamily="Rajdhani" fontWeight={500}>
      ⊛ {wormhole}
    </text>
  );
}

// ── Tech badge ──────────────────────────────────────────────────

function TechBadge({ x, y, tech, size = 3.5 }: { x: number; y: number; tech: TechSpecialty; size?: number }) {
  const color = techColor(tech);
  return (
    <g>
      <circle cx={x} cy={y} r={size} fill="#0a0a1a" stroke={color} strokeWidth={0.5} />
      <circle cx={x} cy={y} r={size * 0.55} fill={color} opacity={0.8} />
    </g>
  );
}

// ── Compact homeworld planet display ────────────────────────────

function HomePlanetContent({ x, y, homeTile, hexSize }: { x: number; y: number; homeTile: SystemTile; hexSize: number }) {
  const planets: PlanetInfo[] = homeTile.planets || [
    { name: homeTile.name, resources: homeTile.resources, influence: homeTile.influence, tech: homeTile.tech },
  ];

  const count = planets.length;
  const baseY = y + hexSize * 0.15;
  const spacing = count === 1 ? 0 : count === 2 ? 9 : 7;
  const startY = baseY - (spacing * (count - 1)) / 2;

  return (
    <g>
      {planets.map((p, i) => {
        const py = startY + i * spacing;
        const color = techColor(p.tech);
        return (
          <g key={i}>
            <circle cx={x - 11} cy={py} r={3} fill={color} opacity={0.8} />
            <circle cx={x - 11} cy={py} r={1.8} fill="none" stroke="#ffffff18" strokeWidth={0.4} />
            <text
              x={x - 6}
              y={py + 1.5}
              textAnchor="start"
              fill="#8899aa"
              fontSize={3.8}
              fontFamily="Rajdhani"
              opacity={0.8}
            >
              {p.name.length > 9 ? p.name.slice(0, 9) + "…" : p.name}
            </text>
            <text
              x={x + 14}
              y={py + 2}
              textAnchor="end"
              fill="#ccd0dd"
              fontSize={5.5}
              fontFamily="Rajdhani"
              fontWeight={600}
            >
              {p.resources}/{p.influence}
            </text>
            {p.tech && <TechBadge x={x - 17} y={py} tech={p.tech} size={2.5} />}
          </g>
        );
      })}
    </g>
  );
}

// ── Main component ──────────────────────────────────────────────

const HexTileGraphics = ({ tile, x, y, hexSize, isCenter, isHome, homeTile }: HexTileGraphicsProps) => {
  if (isCenter) return null;

  // Home hex: render compact homeworld planets when faction is assigned
  if (isHome) {
    if (!homeTile) return null;
    return <HomePlanetContent x={x} y={y} homeTile={homeTile} hexSize={hexSize} />;
  }

  const tileIdLabel = tile.id > 0 ? (
    <text x={x} y={y + hexSize * 0.78} textAnchor="middle" fill="#556677" fontSize={5} fontFamily="Rajdhani" opacity={0.5}>
      {tile.id}
    </text>
  ) : null;

  const graphicSize = hexSize * 0.7;

  // Planet tiles
  if (tile.type === "planet") {
    // Planet on anomaly (e.g. Industrex on asteroid, Lemox in entropic scar)
    const hasAnomaly = !!tile.anomaly;

    return (
      <g>
        {/* Background anomaly graphic for planet+anomaly tiles */}
        {hasAnomaly && tile.anomaly === "asteroid" && <AsteroidGraphic x={x} y={y} size={graphicSize * 0.5} />}
        {hasAnomaly && tile.anomaly === "gravity-rift" && <GravityRiftGraphic x={x} y={y} size={graphicSize * 0.5} />}
        {hasAnomaly && tile.anomaly === "nebula" && <NebulaGraphic x={x} y={y} size={graphicSize * 0.5} />}
        {hasAnomaly && tile.anomaly === "entropic-scar" && <EntropicScarGraphic x={x} y={y} size={graphicSize * 0.5} />}

        {/* Planet content */}
        {tile.planets && tile.planets.length === 2 && <TwoPlanetContent x={x} y={y} planets={tile.planets} />}
        {tile.planets && tile.planets.length === 3 && <ThreePlanetContent x={x} y={y} planets={tile.planets} />}
        {!tile.planets && <SinglePlanetContent x={x} y={y} tile={tile} />}

        {/* Wormhole on multi-planet tiles */}
        {tile.planets && tile.wormhole && (
          <WormholeLabel x={x} y={y + (tile.planets.length === 3 ? 25 : 22)} wormhole={tile.wormhole} />
        )}
        {tileIdLabel}
      </g>
    );
  }

  // Pure anomaly tiles
  if (tile.type === "anomaly") {
    return (
      <g>
        {tile.anomaly === "asteroid" && <AsteroidGraphic x={x} y={y} size={graphicSize} />}
        {tile.anomaly === "supernova" && <SupernovaGraphic x={x} y={y} size={graphicSize} />}
        {tile.anomaly === "gravity-rift" && <GravityRiftGraphic x={x} y={y} size={graphicSize} />}
        {tile.anomaly === "nebula" && <NebulaGraphic x={x} y={y} size={graphicSize} />}
        {tile.anomaly === "entropic-scar" && <EntropicScarGraphic x={x} y={y} size={graphicSize} />}
        <text x={x} y={y + graphicSize * 0.9} textAnchor="middle" fill="#aa5566" fontSize={5} fontFamily="Rajdhani" fontWeight={500} opacity={0.8}>
          {tile.anomaly === "gravity-rift" ? "Gravity Rift" :
           tile.anomaly === "asteroid" ? "Asteroids" :
           tile.anomaly === "supernova" ? "Supernova" :
           tile.anomaly === "nebula" ? "Nebula" :
           tile.anomaly === "entropic-scar" ? "Entropic Scar" :
           tile.anomaly}
        </text>
        {tile.wormhole && <WormholeLabel x={x} y={y + graphicSize * 1.2} wormhole={tile.wormhole} />}
        {tileIdLabel}
      </g>
    );
  }

  // Empty tiles with wormhole
  if (tile.type === "empty" && tile.wormhole) {
    return (
      <g>
        <WormholeGraphic x={x} y={y} size={graphicSize} type={tile.wormhole} />
        <text x={x} y={y + graphicSize * 0.7} textAnchor="middle" fill={tile.wormhole === "α" ? "#6699ff" : "#ff9944"} fontSize={7} fontFamily="Rajdhani" fontWeight={500}>
          {tile.wormhole}
        </text>
        {tileIdLabel}
      </g>
    );
  }

  // Pure empty space
  if (tile.type === "empty") {
    return (
      <g>
        {/* Faint star dust */}
        <circle cx={x - 5} cy={y - 3} r={0.4} fill="#334455" opacity={0.4} />
        <circle cx={x + 7} cy={y + 2} r={0.3} fill="#334455" opacity={0.3} />
        <circle cx={x + 2} cy={y - 6} r={0.35} fill="#334455" opacity={0.35} />
        {tileIdLabel}
      </g>
    );
  }

  return null;
};

export default HexTileGraphics;
