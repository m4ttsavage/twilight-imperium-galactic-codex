export interface Faction {
  name: string;
  shortName: string;
  color: string;
  expansion: "base" | "pok" | "te";
  icon: string;
}

export const TI4_FACTIONS: Faction[] = [
  // Base Game (17 factions)
  { name: "The Arborec", shortName: "Arborec", color: "#4a7c3f", expansion: "base", icon: "/faction-icons/arborec.png" },
  { name: "The Barony of Letnev", shortName: "Letnev", color: "#8b0000", expansion: "base", icon: "/faction-icons/letnev.png" },
  { name: "The Clan of Saar", shortName: "Saar", color: "#b8860b", expansion: "base", icon: "/faction-icons/saar.png" },
  { name: "The Embers of Muaat", shortName: "Muaat", color: "#ff4500", expansion: "base", icon: "/faction-icons/muaat.png" },
  { name: "The Emirates of Hacan", shortName: "Hacan", color: "#ffd700", expansion: "base", icon: "/faction-icons/hacan.png" },
  { name: "The Federation of Sol", shortName: "Sol", color: "#4169e1", expansion: "base", icon: "/faction-icons/sol.png" },
  { name: "The Ghosts of Creuss", shortName: "Creuss", color: "#00bfff", expansion: "base", icon: "/faction-icons/creuss.png" },
  { name: "The L1Z1X Mindnet", shortName: "L1Z1X", color: "#2f4f4f", expansion: "base", icon: "/faction-icons/l1z1x.png" },
  { name: "The Mentak Coalition", shortName: "Mentak", color: "#ff8c00", expansion: "base", icon: "/faction-icons/mentak.png" },
  { name: "The Naalu Collective", shortName: "Naalu", color: "#9370db", expansion: "base", icon: "/faction-icons/naalu.png" },
  { name: "The Nekro Virus", shortName: "Nekro", color: "#696969", expansion: "base", icon: "/faction-icons/nekro.png" },
  { name: "Sardakk N'orr", shortName: "Sardakk", color: "#dc143c", expansion: "base", icon: "/faction-icons/sardakk.png" },
  { name: "The Universities of Jol-Nar", shortName: "Jol-Nar", color: "#4682b4", expansion: "base", icon: "/faction-icons/jolnar.png" },
  { name: "The Winnu", shortName: "Winnu", color: "#daa520", expansion: "base", icon: "/faction-icons/winnu.png" },
  { name: "The Xxcha Kingdom", shortName: "Xxcha", color: "#228b22", expansion: "base", icon: "/faction-icons/xxcha.png" },
  { name: "The Yin Brotherhood", shortName: "Yin", color: "#f5f5dc", expansion: "base", icon: "/faction-icons/yin.png" },
  { name: "The Yssaril Tribes", shortName: "Yssaril", color: "#006400", expansion: "base", icon: "/faction-icons/yssaril.png" },
  // Prophecy of Kings (7 factions + 1 from Codex III)
  { name: "The Argent Flight", shortName: "Argent", color: "#c0c0c0", expansion: "pok", icon: "/faction-icons/argent.png" },
  { name: "The Empyrean", shortName: "Empyrean", color: "#9932cc", expansion: "pok", icon: "/faction-icons/empyrean.png" },
  { name: "The Mahact Gene-Sorcerers", shortName: "Mahact", color: "#8b4513", expansion: "pok", icon: "/faction-icons/mahact.png" },
  { name: "The Naaz-Rokha Alliance", shortName: "Naaz-Rokha", color: "#808000", expansion: "pok", icon: "/faction-icons/naazrokha.png" },
  { name: "The Nomad", shortName: "Nomad", color: "#708090", expansion: "pok", icon: "/faction-icons/nomad.png" },
  { name: "The Titans of Ul", shortName: "Titans", color: "#b22222", expansion: "pok", icon: "/faction-icons/titans.png" },
  { name: "The Vuil'Raith Cabal", shortName: "Vuil'Raith", color: "#800080", expansion: "pok", icon: "/faction-icons/vuilraith.png" },
  { name: "The Council Keleres", shortName: "Keleres", color: "#4682b4", expansion: "pok", icon: "/faction-icons/keleres.png" },
  // Thunder's Edge (5 factions)
  { name: "The Crimson Rebellion", shortName: "Crimson", color: "#cc2233", expansion: "te", icon: "/faction-icons/crimson.png" },
  { name: "The Deepwrought Scholarate", shortName: "Deepwrought", color: "#1a5276", expansion: "te", icon: "/faction-icons/deepwrought.png" },
  { name: "The Firmament", shortName: "Firmament", color: "#d4af37", expansion: "te", icon: "/faction-icons/firmament.png" },
  { name: "The Obsidian", shortName: "Obsidian", color: "#1c1c1c", expansion: "te", icon: "/faction-icons/obsidian.png" },
  { name: "Last Bastion", shortName: "Last Bastion", color: "#5b8c5a", expansion: "te", icon: "/faction-icons/lastbastion.png" },
  { name: "The Ral Nel Consortium", shortName: "Ral Nel", color: "#7b68ee", expansion: "te", icon: "/faction-icons/ralnel.png" },
];
