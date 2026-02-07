const POOL_1 = [
  "Galactic", "Stellar", "Cosmic", "Nebular", "Frozen", "Crimson", "Ancient",
  "Orbital", "Radiant", "Phantom", "Astral", "Emerald", "Titanium", "Iron",
  "Shadow", "Sapphire", "Gilded", "Obsidian", "Primal", "Veiled", "Luminous",
  "Verdant", "Scarlet", "Azure", "Spectral", "Immortal", "Arcane", "Solar",
  "Lunar", "Infinite", "Eternal", "Crystal", "Amber", "Ivory", "Tempest",
  "Midnight", "Twilight", "Starborn", "Glacial", "Thunder", "Electric",
  "Platinum", "Sovereign", "Warp", "Quantum", "Void", "Feral", "Ashen",
  "Dusted", "Cobalt",
];

const POOL_2 = [
  "Blazing", "Silent", "Drifting", "Shattered", "Hollow", "Molten", "Winding",
  "Volatile", "Shifting", "Sunken", "Howling", "Glinting", "Fractured",
  "Flickering", "Roaming", "Thundering", "Burning", "Whispering", "Towering",
  "Surging", "Smoldering", "Gleaming", "Woven", "Spiraling", "Echoing",
  "Crumbling", "Piercing", "Rushing", "Sweeping", "Churning", "Trembling",
  "Cascading", "Coiling", "Forged", "Tidal", "Spinning", "Crackling",
  "Pulsing", "Streaking", "Rippling", "Seething", "Looming", "Rumbling",
  "Searing", "Roaring", "Dazzling", "Prowling", "Soaring", "Frozen", "Ignited",
];

const POOL_3 = [
  "Pickle", "Comet", "Beacon", "Citadel", "Monsoon", "Vortex", "Pulsar",
  "Eclipse", "Titan", "Nova", "Nebula", "Meteor", "Nexus", "Sentry", "Glacier",
  "Canyon", "Prism", "Relic", "Forge", "Quasar", "Spire", "Bastion", "Raptor",
  "Phoenix", "Kraken", "Specter", "Zenith", "Pebble", "Falcon", "Dagger",
  "Shard", "Pillar", "Summit", "Anvil", "Goblet", "Lantern", "Cipher",
  "Fossil", "Gauntlet", "Harpoon", "Mirage", "Obelisk", "Paragon", "Sapling",
  "Trinket", "Conduit", "Whistle", "Marble", "Compass", "Gadget",
];

const POOL_4 = [
  "Crusade", "Summit", "Rift", "Tempest", "Exodus", "Cascade", "Dominion",
  "Frontier", "Armada", "Odyssey", "Conquest", "Requiem", "Uprising",
  "Outpost", "Mandate", "Volley", "Chronicle", "Expanse", "Gambit", "Accord",
  "Remnant", "Bastion", "Directive", "Imperium", "Prophecy", "Terminus",
  "Venture", "Zenith", "Doctrine", "Vanguard", "Reckoning", "Dominance",
  "Incursion", "Overture", "Protocol", "Resurgence", "Stratagem", "Tribunal",
  "Coalition", "Endeavor", "Manifesto", "Paradigm", "Sanctum", "Threshold",
  "Vendetta", "Watershed", "Crescendo", "Influx", "Proclamation", "Vigil",
];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateGameName(): string {
  return `${pick(POOL_1)} ${pick(POOL_2)} ${pick(POOL_3)} ${pick(POOL_4)}`;
}
