export interface Faction {
  name: string;
  shortName: string;
  color: string;
  expansion: "base" | "pok" | "te";
}

export const TI4_FACTIONS: Faction[] = [
  // Base Game (17 factions)
  { name: "The Arborec", shortName: "Arborec", color: "#4a7c3f", expansion: "base" },
  { name: "The Barony of Letnev", shortName: "Letnev", color: "#8b0000", expansion: "base" },
  { name: "The Clan of Saar", shortName: "Saar", color: "#b8860b", expansion: "base" },
  { name: "The Embers of Muaat", shortName: "Muaat", color: "#ff4500", expansion: "base" },
  { name: "The Emirates of Hacan", shortName: "Hacan", color: "#ffd700", expansion: "base" },
  { name: "The Federation of Sol", shortName: "Sol", color: "#4169e1", expansion: "base" },
  { name: "The Ghosts of Creuss", shortName: "Creuss", color: "#00bfff", expansion: "base" },
  { name: "The L1Z1X Mindnet", shortName: "L1Z1X", color: "#2f4f4f", expansion: "base" },
  { name: "The Mentak Coalition", shortName: "Mentak", color: "#ff8c00", expansion: "base" },
  { name: "The Naalu Collective", shortName: "Naalu", color: "#9370db", expansion: "base" },
  { name: "The Nekro Virus", shortName: "Nekro", color: "#696969", expansion: "base" },
  { name: "Sardakk N'orr", shortName: "Sardakk", color: "#dc143c", expansion: "base" },
  { name: "The Universities of Jol-Nar", shortName: "Jol-Nar", color: "#4682b4", expansion: "base" },
  { name: "The Winnu", shortName: "Winnu", color: "#daa520", expansion: "base" },
  { name: "The Xxcha Kingdom", shortName: "Xxcha", color: "#228b22", expansion: "base" },
  { name: "The Yin Brotherhood", shortName: "Yin", color: "#f5f5dc", expansion: "base" },
  { name: "The Yssaril Tribes", shortName: "Yssaril", color: "#006400", expansion: "base" },
  // Prophecy of Kings (7 factions + 1 from Codex III)
  { name: "The Argent Flight", shortName: "Argent", color: "#c0c0c0", expansion: "pok" },
  { name: "The Empyrean", shortName: "Empyrean", color: "#9932cc", expansion: "pok" },
  { name: "The Mahact Gene-Sorcerers", shortName: "Mahact", color: "#8b4513", expansion: "pok" },
  { name: "The Naaz-Rokha Alliance", shortName: "Naaz-Rokha", color: "#808000", expansion: "pok" },
  { name: "The Nomad", shortName: "Nomad", color: "#708090", expansion: "pok" },
  { name: "The Titans of Ul", shortName: "Titans", color: "#b22222", expansion: "pok" },
  { name: "The Vuil'Raith Cabal", shortName: "Vuil'Raith", color: "#800080", expansion: "pok" },
  { name: "The Council Keleres", shortName: "Keleres", color: "#4682b4", expansion: "pok" },
  // Thunder's Edge (5 factions)
  { name: "The Crimson Rebellion", shortName: "Crimson", color: "#cc2233", expansion: "te" },
  { name: "The Deepwrought Scholarate", shortName: "Deepwrought", color: "#1a5276", expansion: "te" },
  { name: "The Firmament", shortName: "Firmament", color: "#d4af37", expansion: "te" },
  { name: "The Obsidian", shortName: "Obsidian", color: "#1c1c1c", expansion: "te" },
  { name: "Last Bastion", shortName: "Last Bastion", color: "#5b8c5a", expansion: "te" },
  { name: "The Ral Nel Consortium", shortName: "Ral Nel", color: "#7b68ee", expansion: "te" },
];
