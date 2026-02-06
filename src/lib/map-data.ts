import { MECATOL, HOME_TILE, BLUE_TILES, RED_TILES, findTileById } from "./tile-database";

export type HexCoord = [number, number]; // [q, r] axial

export type TechSpecialty = "biotic" | "warfare" | "propulsion" | "cybernetic";

export interface PlanetInfo {
  name: string;
  resources: number;
  influence: number;
  tech?: TechSpecialty;
}

export interface SystemTile {
  id: number;
  name: string;
  resources: number;
  influence: number;
  type: "planet" | "anomaly" | "empty";
  anomaly?: string;
  wormhole?: string;
  tech?: TechSpecialty;
  planets?: PlanetInfo[];
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

export function sliceLabel(index: number): string {
  return String.fromCharCode(65 + index); // A, B, C, …
}

function hexKey(q: number, r: number) {
  return `${q},${r}`;
}

function hexNeighbors(q: number, r: number): HexCoord[] {
  return [[q + 1, r], [q - 1, r], [q, r + 1], [q, r - 1], [q + 1, r - 1], [q - 1, r + 1]];
}

// ── BFS contiguous slice assignment ────────────────────────────

function assignContiguousSlices(hexes: MapHex[], homes: HexCoord[], playerCount: number) {
  // Build coordinate → hex-index lookup
  const coordMap = new Map<string, number>();
  hexes.forEach((h, i) => coordMap.set(hexKey(h.q, h.r), i));

  // Identify normal (non-home, non-center) hex indices
  const normalIndices: number[] = [];
  hexes.forEach((h, i) => {
    if (!h.isHome && !h.isCenter) normalIndices.push(i);
  });

  // Mark all normal hexes as unassigned
  for (const idx of normalIndices) hexes[idx].sliceIndex = -1;

  // Seed BFS frontiers from each home's neighbors
  const frontiers: Set<number>[] = Array.from({ length: playerCount }, () => new Set());
  homes.forEach(([hq, hr], s) => {
    for (const [nq, nr] of hexNeighbors(hq, hr)) {
      const idx = coordMap.get(hexKey(nq, nr));
      if (idx !== undefined && hexes[idx].sliceIndex === -1) {
        frontiers[s].add(idx);
      }
    }
  });

  // Round-robin BFS — each slice claims one hex per round
  let assigned = 0;
  const totalNormal = normalIndices.length;

  while (assigned < totalNormal) {
    let progress = false;
    for (let s = 0; s < playerCount; s++) {
      // Purge stale entries (already claimed by another slice)
      for (const idx of frontiers[s]) {
        if (hexes[idx].sliceIndex !== -1) frontiers[s].delete(idx);
      }
      if (frontiers[s].size === 0) continue;

      // Pick frontier hex closest (hex distance) to this slice's home
      const [hq, hr] = homes[s];
      let bestIdx = -1;
      let bestDist = Infinity;
      for (const idx of frontiers[s]) {
        const dq = hexes[idx].q - hq;
        const dr = hexes[idx].r - hr;
        const dist = Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      }
      if (bestIdx === -1) continue;

      // Claim
      hexes[bestIdx].sliceIndex = s;
      frontiers[s].delete(bestIdx);
      assigned++;
      progress = true;

      // Expand frontier with new neighbors
      for (const [nq, nr] of hexNeighbors(hexes[bestIdx].q, hexes[bestIdx].r)) {
        const nIdx = coordMap.get(hexKey(nq, nr));
        if (nIdx !== undefined && hexes[nIdx].sliceIndex === -1 && !hexes[nIdx].isHome && !hexes[nIdx].isCenter) {
          frontiers[s].add(nIdx);
        }
      }
    }
    if (!progress) break;
  }

  // Fallback: assign any remaining orphans to nearest slice by angle
  for (const idx of normalIndices) {
    if (hexes[idx].sliceIndex !== -1) continue;
    const { x, y } = hexToPixel(hexes[idx].q, hexes[idx].r, 1);
    let bestSlice = 0;
    let bestDist = Infinity;
    homes.forEach(([hq, hr], s) => {
      const { x: hx, y: hy } = hexToPixel(hq, hr, 1);
      const d = Math.hypot(x - hx, y - hy);
      if (d < bestDist) { bestDist = d; bestSlice = s; }
    });
    hexes[idx].sliceIndex = bestSlice;
  }
}

// ── Ring generation (internal map gen — starts east) ───────────

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

// ── Ring generation (TI4 standard — starts north, clockwise) ──

function generateRingTI4(radius: number): HexCoord[] {
  if (radius === 0) return [[0, 0]];
  const dirs: HexCoord[] = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
  const result: HexCoord[] = [];
  let q = 0, r = -radius;
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

export function generateMap(playerCount: number, customBlue?: SystemTile[], customRed?: SystemTile[]): GeneratedMap {
  const config = HOME_CONFIGS[playerCount];
  if (!config) throw new Error(`Unsupported player count: ${playerCount}`);
  const { maxRing, homes } = config;

  const allPos: HexCoord[] = [];
  for (let r = 0; r <= maxRing; r++) allPos.push(...generateRing(r));

  const homeSet = new Set(homes.map(([q, r]) => hexKey(q, r)));
  const normalPos = allPos.filter(([q, r]) => !(q === 0 && r === 0) && !homeSet.has(hexKey(q, r)));

  const total = normalPos.length;
  const blueSrc = customBlue && customBlue.length > 0 ? customBlue : BLUE_TILES;
  const redSrc = customRed && customRed.length > 0 ? customRed : RED_TILES;
  const redCount = Math.max(2, Math.floor(total * 0.2));
  const blueCount = total - redCount;
  const tiles = shuffle([...shuffle(blueSrc).slice(0, blueCount), ...shuffle(redSrc).slice(0, redCount)]);

  const hexes: MapHex[] = [{ q: 0, r: 0, sliceIndex: -1, tile: MECATOL, isHome: false, isCenter: true }];
  homes.forEach(([q, r], i) => hexes.push({ q, r, sliceIndex: i, tile: HOME_TILE, isHome: true, isCenter: false }));
  normalPos.forEach(([q, r], i) => {
    hexes.push({ q, r, sliceIndex: -1, tile: tiles[i % tiles.length], isHome: false, isCenter: false });
  });

  // BFS flood-fill from homes → contiguous, balanced slices
  assignContiguousSlices(hexes, homes, playerCount);

  const sliceStats = Array.from({ length: playerCount }, (_, i) => {
    const sh = hexes.filter((h) => h.sliceIndex === i && !h.isHome);
    return { resources: sh.reduce((s, h) => s + h.tile.resources, 0), influence: sh.reduce((s, h) => s + h.tile.influence, 0), tileCount: sh.length };
  });

  return { playerCount, hexes, sliceStats };
}

export function getSupportedPlayerCounts() {
  return [3, 4, 5, 6];
}

// ── Export map to string ────────────────────────────────────────

export function exportMapString(map: GeneratedMap): string {
  const maxRing = map.playerCount <= 3 ? 2 : 3;

  // Build TI4 ring order positions
  const ringPositions: HexCoord[] = [];
  for (let r = 1; r <= maxRing; r++) ringPositions.push(...generateRingTI4(r));

  // Create a lookup from hex coord to tile
  const hexLookup = new Map<string, MapHex>();
  map.hexes.forEach((h) => hexLookup.set(hexKey(h.q, h.r), h));

  // Map each ring position to its tile ID
  const ids = ringPositions.map(([q, r]) => {
    const hex = hexLookup.get(hexKey(q, r));
    if (!hex) return 0;
    return hex.tile.id;
  });

  return ids.join(" ");
}

// ── Parse map string ───────────────────────────────────────────

export function parseMapString(input: string): GeneratedMap {
  const ids = input
    .trim()
    .split(/[\s,;]+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));

  if (ids.length === 0) throw new Error("No valid tile IDs found.");

  const ringTileIds = ids[0] === 18 ? ids.slice(1) : ids;

  let playerCount: number;
  let maxRing: number;
  if (ringTileIds.length <= 18) {
    playerCount = 3;
    maxRing = 2;
  } else if (ringTileIds.length <= 36) {
    playerCount = 6;
    maxRing = 3;
  } else {
    throw new Error(`Unexpected tile count: ${ringTileIds.length}. Expected 18 (3p) or 36 (6p).`);
  }

  const config = HOME_CONFIGS[playerCount];
  if (!config) throw new Error(`No layout config for ${playerCount} players.`);
  const { homes } = config;

  // Use TI4 standard ring order (north start, clockwise)
  const ringPositions: HexCoord[] = [];
  for (let r = 1; r <= maxRing; r++) ringPositions.push(...generateRingTI4(r));

  if (ringTileIds.length > ringPositions.length) {
    throw new Error(`Too many tiles (${ringTileIds.length}) for a ${maxRing}-ring map (${ringPositions.length} positions).`);
  }

  const homeSet = new Set(homes.map(([q, r]) => hexKey(q, r)));

  const hexes: MapHex[] = [{ q: 0, r: 0, sliceIndex: -1, tile: MECATOL, isHome: false, isCenter: true }];

  ringPositions.forEach(([q, r], i) => {
    const tileId = i < ringTileIds.length ? ringTileIds[i] : 47;
    const isHome = homeSet.has(hexKey(q, r)) || tileId === 0;
    const tile = isHome ? HOME_TILE : findTileById(tileId);
    const sliceIndex = getSliceIndex(q, r, homes);
    hexes.push({ q, r, sliceIndex, tile, isHome, isCenter: false });
  });

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
