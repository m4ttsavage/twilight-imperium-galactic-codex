export interface StrategyCard {
  number: number;
  name: string;
  primary: string;
  secondary: string;
  color: string;
}

export const STRATEGY_CARDS: StrategyCard[] = [
  {
    number: 1,
    name: "Leadership",
    primary: "Gain 3 command tokens. Then, spend any amount of influence to gain 1 command token for every 3 influence spent.",
    secondary: "Spend any amount of influence to gain 1 command token for every 3 influence spent.",
    color: "#e63946",
  },
  {
    number: 2,
    name: "Diplomacy",
    primary: "Choose 1 system other than the Mecatol Rex system that contains a planet you control. Each other player places a command token from their reinforcements in that system. Then, ready each exhausted planet you control in that system.",
    secondary: "Spend 1 token from your strategy pool to ready up to 2 exhausted planets you control.",
    color: "#f4a261",
  },
  {
    number: 3,
    name: "Politics",
    primary: "Choose a player other than the speaker. That player gains the speaker token. Then, draw 2 action cards. Then, look at the top 2 cards of the agenda deck. Place each card on the top or bottom of the agenda deck in any order.",
    secondary: "Spend 1 token from your strategy pool to draw 2 action cards.",
    color: "#e9c46a",
  },
  {
    number: 4,
    name: "Construction",
    primary: "Place 1 PDS or 1 space dock on a planet you control. Then, place 1 PDS on a planet you control.",
    secondary: "Spend 1 token from your strategy pool and place it in any system. Then, place 1 structure on a planet you control in that system.",
    color: "#2a9d8f",
  },
  {
    number: 5,
    name: "Trade",
    primary: "Gain 3 trade goods. Then, replenish commodities. Then, choose any number of other players. Those players use the secondary ability of this strategy card without spending a command token.",
    secondary: "Spend 1 token from your strategy pool to replenish your commodities.",
    color: "#264653",
  },
  {
    number: 6,
    name: "Warfare",
    primary: "Remove 1 of your command tokens from the game board. Then, gain 1 command token. Then, redistribute any number of the command tokens on your command sheet.",
    secondary: "Spend 1 token from your strategy pool to use the PRODUCTION ability of 1 of your space docks in your home system.",
    color: "#d62828",
  },
  {
    number: 7,
    name: "Technology",
    primary: "Research 1 technology. Then, you may spend 6 resources to research 1 additional technology.",
    secondary: "Spend 1 token from your strategy pool and 4 resources to research 1 technology.",
    color: "#457b9d",
  },
  {
    number: 8,
    name: "Imperial",
    primary: "Immediately score 1 public objective if you fulfill its requirements. Then, if you control Mecatol Rex, gain 1 victory point. Then, draw 1 secret objective.",
    secondary: "Spend 1 token from your strategy pool to draw 1 secret objective.",
    color: "#6a0572",
  },
];
