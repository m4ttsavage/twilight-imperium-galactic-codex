import type { SystemTile } from "./map-data";

// ── Constants ──────────────────────────────────────────────────

export const MECATOL: SystemTile = { id: 18, name: "Mecatol Rex", resources: 1, influence: 6, type: "planet" };
export const HOME_TILE: SystemTile = { id: 0, name: "Home System", resources: 0, influence: 0, type: "planet" };

// ── Base Game Blue Tiles (19–38) ───────────────────────────────

const BASE_BLUE: SystemTile[] = [
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
];

// ── Base Game Red Tiles (39–50) ────────────────────────────────

const BASE_RED: SystemTile[] = [
  { id: 39, name: "α Wormhole", resources: 0, influence: 0, type: "empty", wormhole: "α" },
  { id: 40, name: "β Wormhole", resources: 0, influence: 0, type: "empty", wormhole: "β" },
  { id: 41, name: "Gravity Rift", resources: 0, influence: 0, type: "anomaly", anomaly: "gravity-rift" },
  { id: 42, name: "Nebula", resources: 0, influence: 0, type: "anomaly", anomaly: "nebula" },
  { id: 43, name: "Supernova", resources: 0, influence: 0, type: "anomaly", anomaly: "supernova" },
  { id: 44, name: "Asteroid Field", resources: 0, influence: 0, type: "anomaly", anomaly: "asteroid" },
  { id: 45, name: "Asteroid Field", resources: 0, influence: 0, type: "anomaly", anomaly: "asteroid" },
  { id: 46, name: "Empty Space", resources: 0, influence: 0, type: "empty" },
  { id: 47, name: "Empty Space", resources: 0, influence: 0, type: "empty" },
  { id: 48, name: "Empty Space", resources: 0, influence: 0, type: "empty" },
  { id: 49, name: "Empty Space", resources: 0, influence: 0, type: "empty" },
  { id: 50, name: "Empty Space", resources: 0, influence: 0, type: "empty" },
];

// ── Prophecy of Kings Blue Tiles (59–76) ───────────────────────

const POK_BLUE: SystemTile[] = [
  { id: 59, name: "Archon Vail", resources: 1, influence: 3, type: "planet" },
  { id: 60, name: "Perimeter", resources: 2, influence: 1, type: "planet" },
  { id: 61, name: "Ang", resources: 2, influence: 0, type: "planet" },
  { id: 62, name: "Sem-Lore", resources: 3, influence: 2, type: "planet" },
  { id: 63, name: "Vorhal", resources: 0, influence: 2, type: "planet" },
  { id: 64, name: "Atlas", resources: 3, influence: 1, type: "planet", wormhole: "β" },
  { id: 65, name: "Primor", resources: 2, influence: 1, type: "planet" },
  { id: 66, name: "Hope's End", resources: 3, influence: 0, type: "planet" },
  { id: 67, name: "Cormund", resources: 2, influence: 0, type: "planet", anomaly: "gravity-rift" },
  { id: 68, name: "Everra", resources: 3, influence: 1, type: "planet", anomaly: "nebula" },
  { id: 69, name: "Accoen / Jeol Ir", resources: 4, influence: 6, type: "planet" },
  { id: 70, name: "Kraag / Siig", resources: 2, influence: 3, type: "planet" },
  { id: 71, name: "Alio Prima / Ba'kal", resources: 4, influence: 3, type: "planet" },
  { id: 72, name: "Lisis / Velnor", resources: 4, influence: 3, type: "planet" },
  { id: 73, name: "Cealdri / Xanhact", resources: 0, influence: 3, type: "planet" },
  { id: 74, name: "Vega Major / Vega Minor", resources: 3, influence: 3, type: "planet" },
  { id: 75, name: "Abaddon / Ashtroth / Loki", resources: 4, influence: 2, type: "planet" },
  { id: 76, name: "Rigel I / II / III", resources: 2, influence: 4, type: "planet" },
];

// ── Prophecy of Kings Red Tiles (77–80) ────────────────────────

const POK_RED: SystemTile[] = [
  { id: 77, name: "Empty Space", resources: 0, influence: 0, type: "empty" },
  { id: 78, name: "Empty Space", resources: 0, influence: 0, type: "empty" },
  { id: 79, name: "Asteroid Field", resources: 0, influence: 0, type: "anomaly", anomaly: "asteroid", wormhole: "α" },
  { id: 80, name: "Supernova", resources: 0, influence: 0, type: "anomaly", anomaly: "supernova" },
];

// ── Thunder's Edge / Codex Tiles (97–117) ──────────────────────

const EXPANSION_BLUE: SystemTile[] = [
  { id: 97, name: "Faunus", resources: 1, influence: 3, type: "planet" },
  { id: 98, name: "Garbozia", resources: 2, influence: 1, type: "planet" },
  { id: 99, name: "Emelpar", resources: 0, influence: 2, type: "planet" },
  { id: 100, name: "Tempesta", resources: 1, influence: 1, type: "planet" },
  { id: 101, name: "Olergodt", resources: 2, influence: 1, type: "planet" },
  { id: 102, name: "Andeara", resources: 1, influence: 1, type: "planet", wormhole: "α" },
  { id: 103, name: "Vira-Pics III", resources: 2, influence: 3, type: "planet" },
  { id: 104, name: "Lesab", resources: 2, influence: 1, type: "planet" },
  { id: 105, name: "New Terra / Tinnes", resources: 3, influence: 2, type: "planet" },
  { id: 106, name: "Cresius / Lazul Rex", resources: 2, influence: 3, type: "planet" },
  { id: 107, name: "Tiamat / Hercalor", resources: 2, influence: 2, type: "planet" },
  { id: 108, name: "Kostboth / Capha", resources: 3, influence: 1, type: "planet" },
  { id: 109, name: "Bellatrix / Tsion Stn", resources: 2, influence: 3, type: "planet" },
  { id: 110, name: "Horizon / El'Nath / Luthien VI", resources: 6, influence: 3, type: "planet" },
  { id: 111, name: "Tarana / Oluz Stn", resources: 2, influence: 3, type: "planet" },
];

const EXPANSION_RED: SystemTile[] = [
  { id: 113, name: "Gravity Rift", resources: 0, influence: 0, type: "anomaly", anomaly: "gravity-rift", wormhole: "β" },
  { id: 114, name: "Entropic Scar", resources: 0, influence: 0, type: "anomaly", anomaly: "entropic-scar" },
  { id: 115, name: "Industrex", resources: 2, influence: 0, type: "planet", anomaly: "asteroid" },
  { id: 116, name: "Lemox", resources: 0, influence: 3, type: "planet", anomaly: "entropic-scar" },
  { id: 117, name: "The Watchtower", resources: 1, influence: 1, type: "planet", anomaly: "asteroid" },
];

// ── Exports ────────────────────────────────────────────────────

export const BLUE_TILES: SystemTile[] = [...BASE_BLUE, ...POK_BLUE, ...EXPANSION_BLUE];
export const RED_TILES: SystemTile[] = [...BASE_RED, ...POK_RED, ...EXPANSION_RED];

const ALL_TILES: SystemTile[] = [MECATOL, HOME_TILE, ...BLUE_TILES, ...RED_TILES];
const tileMap = new Map<number, SystemTile>(ALL_TILES.map((t) => [t.id, t]));

export function findTileById(id: number): SystemTile {
  return tileMap.get(id) || { id, name: `Tile ${id}`, resources: 0, influence: 0, type: "empty" };
}
