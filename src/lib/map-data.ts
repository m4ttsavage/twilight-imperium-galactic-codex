export type HexCoord = [number, number]; // [q, r] axial

export interface SystemTile {
  id: number;
  name: string;
  resources: number;
  influence: number;
  type: "planet" | "anomaly" | "empty";
  anomaly?: string;
  wormhole?: string;
}

export interface MapHex {
  q: number;
  r: number;
  sliceIndex: number; // -1 for center
  tile: SystemTile;
  isHome: boolean;
  isCenter: boolean;
}

export interface GeneratedMap {
  playerCount: number;
  hexes: MapHex[];
  sliceStats: { resources: number; influence: number; tileCount: number }[];
}

// ── Hex utilities ──────────────────────────────────────────────

export function hexToPixel(q: number, r: number, size: number) {
  return {
    x: size * ((3 / 2) * q),
    y: size * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r),
  };
}

export function hexPoints(cx: number, cy: number, size: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (60 * i * Math.PI) / 180;
    return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
  }).join(" ");
}

function hexKey(q: number, r: number) {
  return `${q},${r}`;
}

// ── Ring generation ────────────────────────────────────────────

function generateRing(radius: number): HexCoord[] {
  if (radius === 0) return [[0, 0]];
  const dirs: HexCoord[] = [[-1, 1], [-1, 0], [0, -1], [1, -1], [1, 0], [0, 1]];
  const result: HexCoord[] = [];
  let q = radius, r = 0;
  for (let d = 0; d < 6; d++) {
    for (let s = 0; s < radius; s++) {
      result.push([q, r]);
      q += dirs[d][0];
      r += dirs[d][1];
    }
  }
  return result;
}

// ── Slice assignment by angle ──────────────────────────────────

function getSliceIndex(q: number, r: number, homes: HexCoord[]): number {
  const { x, y } = hexToPixel(q, r, 1);
  const angle = Math.atan2(y, x);
  let best = 0;
  let bestDiff = Infinity;
  homes.forEach(([hq, hr], i) => {
    const { x: hx, y: hy } = hexToPixel(hq, hr, 1);
    const hAngle = Math.atan2(hy, hx);
    let diff = Math.abs(angle - hAngle);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  });
  return best;
}

// ── Layout configs ─────────────────────────────────────────────

const HOME_CONFIGS: Record<number, { maxRing: number; homes: HexCoord[] }> = {
  3: { maxRing: 2, homes: [[2, 0], [-2, 2], [0, -2]] },
  4: { maxRing: 3, homes: [[3, 0], [-1, 3], [-3, 0], [1, -3]] },
  5: { maxRing: 3, homes: [[3, 0], [0, 3], [-3, 2], [-1, -2], [2, -3]] },
  6: { maxRing: 3, homes: [[3, 0], [0, 3], [-3, 3], [-3, 0], [0, -3], [3, -3]] },
};

// ── System tile pools ──────────────────────────────────────────

const MECATOL: SystemTile = { id: 18, name: "Mecatol Rex", resources: 1, influence: 6, type: "planet" };
const HOME_TILE: SystemTile = { id: 0, name: "Home System", resources: 0, influence: 0, type: "planet" };

const BLUE_TILES: SystemTile[] = [
  { id: 19, name: "Wellon", resources: 1, influence: 2, type: "planet" },
  { id: 20, name: "Vefut II", resources: 2, influence: 2, type: "planet" },
  { id: 21, name: "Thibah", resources: 1, influence: 1, type: "planet" },
  { id: 22, name: "Tar'Mann", resources: 1, influence: 1, type: "planet" },
  { id: 23, name: "Saudor", resources: 2, influence: 2, type: "planet" },
  { id: 24, name: "Mehar Xull", resources: 1, influence: 3, type: "planet" },
  { id: 25, name: "Quann", resources: 2, influence: 1, type: "planet", wormhole: "β" },
  { id: 26, name: "Lodor", resources: 3, influence: 1, type: "planet", wormhole: "α" },
  { id: 27, name: "New Albion / Starpoint", resources: 4, influence: 2, type: "planet" },
  { id: 28, name: "Tequ'ran / Torkan", resources: 2, influence: 3, type: "planet" },
  { id: 29, name: "Qucen'n / Rarron", resources: 1, influence: 5, type: "planet" },
  { id: 30, name: "Mellon / Zohbat", resources: 3, influence: 3, type: "planet" },
  { id: 31, name: "Lazar / Sakulag", resources: 3, influence: 1, type: "planet" },
  { id: 32, name: "Dal Bootha / Xxehan", resources: 1, influence: 3, type: "planet" },
  { id: 33, name: "Corneeq / Resculon", resources: 3, influence: 2, type: "planet" },
  { id: 34, name: "Centauri / Gral", resources: 2, influence: 4, type: "planet" },
  { id: 35, name: "Bereg / Lirta IV", resources: 5, influence: 4, type: "planet" },
  { id: 36, name: "Arnor / Lor", resources: 3, influence: 3, type: "planet" },
  { id: 37, name: "Arinam / Meer", resources: 1, influence: 6, type: "planet" },
  { id: 38, name: "Abyz / Fria", resources: 5, influence: 0, type: "planet" },
  { id: 59, name: "Archon Vail", resources: 1, influence: 3, type: "planet" },
  { id: 60, name: "Perimeter", resources: 2, influence: 1, type: "planet" },
  { id: 61, name: "Ang", resources: 2, influence: 0, type: "planet" },
  { id: 62, name: "Sem-Lore", resources: 2, influence: 2, type: "planet" },
  { id: 64, name: "Atlas", resources: 3, influence: 1, type: "planet" },
  { id: 65, name: "Primor", resources: 2, influence: 1, type: "planet" },
  { id: 66, name: "Hope's End", resources: 3, influence: 0, type: "planet" },
  { id: 67, name: "Cormund / Everra", resources: 2, influence: 3, type: "planet" },
  { id: 68, name: "Accoen / Jeol Ir", resources: 3, influence: 3, type: "planet" },
  { id: 69, name: "Kraag / Siig", resources: 2, influence: 3, type: "planet" },
];

const RED_TILES: SystemTile[] = [
  { id: 39, name: "α Wormhole", resources: 0, influence: 0, type: "empty", wormhole: "α" },
  { id: 40, name: "β Wormhole", resources: 0, influence: 0, type: "empty", wormhole: "β" },
  { id: 41, name: "Gravity Rift", resources: 0, influence: 0, type: "anomaly", anomaly: "gravity-rift" },
  { id: 42, name: "Nebula", resources: 0, influence: 0, type: "anomaly", anomaly: "nebula" },
  { id: 43, name: "Supernova", resources: 0, influence: 0, type: "anomaly", anomaly: "supernova" },
  { id: 44, name: "Asteroid Field", resources: 0, influence: 0, type: "anomaly", anomaly: "asteroid" },
  { id: 45, name: "Asteroid Field", resources: 0, influence: 0, type: "anomaly", anomaly: "asteroid" },
  { id: 46, name: "Empty Space", resources: 0, influence: 0, type: "empty" },
  { id: 47, name: "Empty Space", resources: 0, influence: 0, type: "empty" },
];

// ── Shuffle ────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

// ── Slice colors ───────────────────────────────────────────────

export const SLICE_COLORS = [
  "#d4a843", "#4db8a4", "#9370db", "#dc143c", "#4169e1", "#228b22", "#ff8c00", "#00bfff",
];

// ── Map generation ─────────────────────────────────────────────

export function generateMap(playerCount: number): GeneratedMap {
  const config = HOME_CONFIGS[playerCount];
  if (!config) throw new Error(`Unsupported player count: ${playerCount}`);
  const { maxRing, homes } = config;

  // All positions
  const allPos: HexCoord[] = [];
  for (let r = 0; r <= maxRing; r++) allPos.push(...generateRing(r));

  const homeSet = new Set(homes.map(([q, r]) => hexKey(q, r)));
  const normalPos = allPos.filter(([q, r]) => !(q === 0 && r === 0) && !homeSet.has(hexKey(q, r)));

  // Pick tiles
  const total = normalPos.length;
  const redCount = Math.max(2, Math.floor(total * 0.2));
  const blueCount = total - redCount;
  const tiles = shuffle([...shuffle(BLUE_TILES).slice(0, blueCount), ...shuffle(RED_TILES).slice(0, redCount)]);

  // Build hexes
  const hexes: MapHex[] = [{ q: 0, r: 0, sliceIndex: -1, tile: MECATOL, isHome: false, isCenter: true }];
  homes.forEach(([q, r], i) => hexes.push({ q, r, sliceIndex: i, tile: HOME_TILE, isHome: true, isCenter: false }));
  normalPos.forEach(([q, r], i) => {
    hexes.push({ q, r, sliceIndex: getSliceIndex(q, r, homes), tile: tiles[i % tiles.length], isHome: false, isCenter: false });
  });

  // Slice stats
  const sliceStats = Array.from({ length: playerCount }, (_, i) => {
    const sh = hexes.filter((h) => h.sliceIndex === i && !h.isHome);
    return { resources: sh.reduce((s, h) => s + h.tile.resources, 0), influence: sh.reduce((s, h) => s + h.tile.influence, 0), tileCount: sh.length };
  });

  return { playerCount, hexes, sliceStats };
}

export function getSupportedPlayerCounts() {
  return [3, 4, 5, 6];
}

// ── Tile lookup ────────────────────────────────────────────────

const ALL_TILES: SystemTile[] = [MECATOL, HOME_TILE, ...BLUE_TILES, ...RED_TILES];

function findTileById(id: number): SystemTile {
  return ALL_TILES.find((t) => t.id === id) || { id, name: `Tile ${id}`, resources: 0, influence: 0, type: "empty" };
}

// ── Parse map string ───────────────────────────────────────────

export function parseMapString(input: string): GeneratedMap {
  // Accept space, comma, or semicolon separators
  const ids = input
    .trim()
    .split(/[\s,;]+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));

  if (ids.length === 0) throw new Error("No valid tile IDs found.");

  // First ID is always Mecatol (center) — skip it for ring tiles
  const ringTileIds = ids[0] === 18 ? ids.slice(1) : ids;

  // Determine player count from tile count
  let playerCount: number;
  let maxRing: number;
  if (ringTileIds.length <= 18) {
    // 3-player: 18 ring positions (6 ring1 + 12 ring2)
    playerCount = 3;
    maxRing = 2;
  } else if (ringTileIds.length <= 36) {
    // 6-player: 36 ring positions (6 ring1 + 12 ring2 + 18 ring3)
    playerCount = 6;
    maxRing = 3;
  } else {
    throw new Error(`Unexpected tile count: ${ringTileIds.length}. Expected 18 (3p) or 36 (6p).`);
  }

  const config = HOME_CONFIGS[playerCount];
  if (!config) throw new Error(`No layout config for ${playerCount} players.`);
  const { homes } = config;

  // Generate all ring positions in spiral order (matching standard TI4 map string order)
  const ringPositions: HexCoord[] = [];
  for (let r = 1; r <= maxRing; r++) ringPositions.push(...generateRing(r));

  if (ringTileIds.length > ringPositions.length) {
    throw new Error(`Too many tiles (${ringTileIds.length}) for a ${maxRing}-ring map (${ringPositions.length} positions).`);
  }

  const homeSet = new Set(homes.map(([q, r]) => hexKey(q, r)));

  // Build hexes
  const hexes: MapHex[] = [{ q: 0, r: 0, sliceIndex: -1, tile: MECATOL, isHome: false, isCenter: true }];

  ringPositions.forEach(([q, r], i) => {
    const tileId = i < ringTileIds.length ? ringTileIds[i] : 47; // fallback to empty
    const isHome = homeSet.has(hexKey(q, r)) || tileId === 0;
    const tile = isHome ? HOME_TILE : findTileById(tileId);
    const sliceIndex = getSliceIndex(q, r, homes);
    hexes.push({ q, r, sliceIndex, tile, isHome, isCenter: false });
  });

  // Slice stats
  const sliceStats = Array.from({ length: playerCount }, (_, i) => {
    const sh = hexes.filter((h) => h.sliceIndex === i && !h.isHome);
    return {
      resources: sh.reduce((s, h) => s + h.tile.resources, 0),
      influence: sh.reduce((s, h) => s + h.tile.influence, 0),
      tileCount: sh.length,
    };
  });

  return { playerCount, hexes, sliceStats };
}
