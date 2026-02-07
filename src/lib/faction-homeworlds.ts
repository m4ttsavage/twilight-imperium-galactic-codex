import type { SystemTile } from "./map-data";

/**
 * Canonical TI4 homeworld data for each faction.
 * Maps faction name → SystemTile with planet info (resources, influence, tech).
 * IDs use 5000+ range to avoid collision with standard tile IDs.
 */
export const FACTION_HOMEWORLDS: Record<string, SystemTile> = {
  // ── Base Game ────────────────────────────────────────────────
  "The Arborec": {
    id: 5001, name: "Nestphar", resources: 2, influence: 1, type: "planet",
  },
  "The Barony of Letnev": {
    id: 5002, name: "Arc Prime / Wren Terra", resources: 6, influence: 1, type: "planet",
    planets: [
      { name: "Arc Prime", resources: 4, influence: 0 },
      { name: "Wren Terra", resources: 2, influence: 1 },
    ],
  },
  "The Clan of Saar": {
    id: 5003, name: "Lisis II / Ragh", resources: 3, influence: 1, type: "planet",
    planets: [
      { name: "Lisis II", resources: 1, influence: 0 },
      { name: "Ragh", resources: 2, influence: 1 },
    ],
  },
  "The Embers of Muaat": {
    id: 5004, name: "Muaat", resources: 4, influence: 1, type: "planet",
  },
  "The Emirates of Hacan": {
    id: 5005, name: "Arretze / Hercant / Kamdorn", resources: 3, influence: 2, type: "planet",
    planets: [
      { name: "Arretze", resources: 2, influence: 0 },
      { name: "Hercant", resources: 1, influence: 1 },
      { name: "Kamdorn", resources: 0, influence: 1 },
    ],
  },
  "The Federation of Sol": {
    id: 5006, name: "Jord", resources: 4, influence: 2, type: "planet",
  },
  "The Ghosts of Creuss": {
    id: 5007, name: "Creuss", resources: 4, influence: 2, type: "planet",
  },
  "The L1Z1X Mindnet": {
    id: 5008, name: "[0.0.0]", resources: 5, influence: 0, type: "planet",
  },
  "The Mentak Coalition": {
    id: 5009, name: "Moll Primus", resources: 4, influence: 1, type: "planet",
  },
  "The Naalu Collective": {
    id: 5010, name: "Druaa / Maaluuk", resources: 3, influence: 3, type: "planet",
    planets: [
      { name: "Druaa", resources: 3, influence: 1 },
      { name: "Maaluuk", resources: 0, influence: 2 },
    ],
  },
  "The Nekro Virus": {
    id: 5011, name: "Mordai II", resources: 4, influence: 0, type: "planet",
  },
  "Sardakk N'orr": {
    id: 5012, name: "Tren'Lak / Quinarra", resources: 4, influence: 1, type: "planet",
    planets: [
      { name: "Tren'Lak", resources: 1, influence: 0 },
      { name: "Quinarra", resources: 3, influence: 1 },
    ],
  },
  "The Universities of Jol-Nar": {
    id: 5013, name: "Jol / Nar", resources: 3, influence: 5, type: "planet",
    planets: [
      { name: "Jol", resources: 1, influence: 2 },
      { name: "Nar", resources: 2, influence: 3 },
    ],
  },
  "The Winnu": {
    id: 5014, name: "Winnu", resources: 3, influence: 4, type: "planet",
  },
  "The Xxcha Kingdom": {
    id: 5015, name: "Archon Ren / Archon Tau", resources: 3, influence: 4, type: "planet",
    planets: [
      { name: "Archon Ren", resources: 2, influence: 3 },
      { name: "Archon Tau", resources: 1, influence: 1 },
    ],
  },
  "The Yin Brotherhood": {
    id: 5016, name: "Darien", resources: 4, influence: 4, type: "planet",
  },
  "The Yssaril Tribes": {
    id: 5017, name: "Retillion / Shalloq", resources: 3, influence: 5, type: "planet",
    planets: [
      { name: "Retillion", resources: 2, influence: 3 },
      { name: "Shalloq", resources: 1, influence: 2 },
    ],
  },

  // ── Prophecy of Kings ────────────────────────────────────────
  "The Argent Flight": {
    id: 5018, name: "Avar / Ylir / Valk", resources: 3, influence: 3, type: "planet",
    planets: [
      { name: "Avar", resources: 1, influence: 1 },
      { name: "Ylir", resources: 0, influence: 2 },
      { name: "Valk", resources: 2, influence: 0 },
    ],
  },
  "The Empyrean": {
    id: 5019, name: "The Dark", resources: 3, influence: 4, type: "planet",
  },
  "The Mahact Gene-Sorcerers": {
    id: 5020, name: "Ixth", resources: 3, influence: 5, type: "planet",
  },
  "The Naaz-Rokha Alliance": {
    id: 5021, name: "Naazir / Rokha", resources: 3, influence: 3, type: "planet",
    planets: [
      { name: "Naazir", resources: 2, influence: 1 },
      { name: "Rokha", resources: 1, influence: 2 },
    ],
  },
  "The Nomad": {
    id: 5022, name: "Arcturus", resources: 4, influence: 3, type: "planet",
  },
  "The Titans of Ul": {
    id: 5023, name: "Elysium", resources: 4, influence: 1, type: "planet",
  },
  "The Vuil'Raith Cabal": {
    id: 5024, name: "Acheron", resources: 4, influence: 0, type: "planet",
  },
  "The Council Keleres": {
    id: 5025, name: "Custodia", resources: 3, influence: 3, type: "planet",
  },

  // ── Thunder's Edge ───────────────────────────────────────────
  "The Crimson Rebellion": {
    id: 5026, name: "Ember / Ashfall", resources: 3, influence: 2, type: "planet",
    planets: [
      { name: "Ember", resources: 2, influence: 1 },
      { name: "Ashfall", resources: 1, influence: 1 },
    ],
  },
  "The Deepwrought Scholarate": {
    id: 5027, name: "Deepwell", resources: 3, influence: 3, type: "planet",
  },
  "The Firmament": {
    id: 5028, name: "Aethon / Spire", resources: 3, influence: 3, type: "planet",
    planets: [
      { name: "Aethon", resources: 2, influence: 1 },
      { name: "Spire", resources: 1, influence: 2 },
    ],
  },
  "The Obsidian": {
    id: 5029, name: "Obsidias", resources: 4, influence: 1, type: "planet",
  },
  "Last Bastion": {
    id: 5030, name: "Bastion / Refuge", resources: 3, influence: 2, type: "planet",
    planets: [
      { name: "Bastion", resources: 2, influence: 1 },
      { name: "Refuge", resources: 1, influence: 1 },
    ],
  },
  "The Ral Nel Consortium": {
    id: 5031, name: "Ral Nel Prime", resources: 2, influence: 3, type: "planet",
  },
};
