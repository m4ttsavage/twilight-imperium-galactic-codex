export interface PlayerPrefs {
  playerId: string;
  playerName: string;
  pref1: string;
  pref2: string;
  pref3: string;
}

export interface FateMessage {
  winnerId: string;
  loserId: string;
  winnerName: string;
  loserName: string;
  winnerFaction: string;
  loserFaction: string;
  message: string;
}

export interface DraftResult {
  assignments: Record<string, string>; // playerId -> factionName
  fateMessages: FateMessage[];
}

const FATE_TEMPLATES = [
  "Fate has decreed that {winner} shall command {winFaction}. Sorry {loser} — RNGesus has chosen {loseFaction} for you instead.",
  "The Galactic Council has spoken! {winner} takes the helm of {winFaction}. {loser}, may {loseFaction} serve you well… or at least adequately.",
  "By cosmic decree, {winner} inherits {winFaction}. {loser}, the stars have aligned you with {loseFaction}. Blame the dice gods.",
  "After a heated deliberation in the warp, {winner} emerges victorious with {winFaction}! {loser} is consoled with {loseFaction}. The galaxy is cruel.",
  "RNGesus has intervened! {winner} secures {winFaction}. {loser} shall lead {loseFaction} — perhaps destiny knows something we don't.",
  "The ancient prophecy foretold: {winner} was always meant for {winFaction}. {loser} — {loseFaction} has been waiting for you. Probably.",
];

function pickFateMessage(
  winnerName: string,
  loserName: string,
  winFaction: string,
  loseFaction: string,
): string {
  const template = FATE_TEMPLATES[Math.floor(Math.random() * FATE_TEMPLATES.length)];
  return template
    .replace("{winner}", winnerName)
    .replace("{loser}", loserName)
    .replace("{winFaction}", winFaction)
    .replace("{loseFaction}", loseFaction);
}

/**
 * Resolve ranked-choice faction draft.
 *
 * Algorithm:
 * 1. For each player, build their preference list [pref1, pref2, pref3].
 * 2. Process preferences round by round (round 1 = pref1, round 2 = pref2, etc.).
 * 3. In each round, for factions claimed by exactly one unassigned player, assign immediately.
 * 4. For factions claimed by multiple players at the same rank, RNG breaks the tie.
 *    Winner gets the faction. Losers fall through to their next preference.
 * 5. After 3 rounds, any remaining unassigned players get a random unclaimed faction.
 */
export function resolveRankedChoiceDraft(players: PlayerPrefs[]): DraftResult {
  const assignments: Record<string, string> = {};
  const fateMessages: FateMessage[] = [];
  const assignedFactions = new Set<string>();
  const unassignedPlayers = new Set(players.map((p) => p.playerId));

  // Build preference arrays
  const prefs: Record<string, string[]> = {};
  for (const p of players) {
    prefs[p.playerId] = [p.pref1, p.pref2, p.pref3];
  }

  const playerMap = new Map(players.map((p) => [p.playerId, p]));

  // Process 3 rounds
  for (let round = 0; round < 3; round++) {
    if (unassignedPlayers.size === 0) break;

    // Build faction -> claimants for this round
    const claims = new Map<string, string[]>();
    for (const pid of unassignedPlayers) {
      const faction = prefs[pid][round];
      if (!faction || assignedFactions.has(faction)) continue;
      if (!claims.has(faction)) claims.set(faction, []);
      claims.get(faction)!.push(pid);
    }

    // Resolve claims
    for (const [faction, claimants] of claims) {
      if (assignedFactions.has(faction)) continue;

      if (claimants.length === 1) {
        // Uncontested
        const pid = claimants[0];
        assignments[pid] = faction;
        assignedFactions.add(faction);
        unassignedPlayers.delete(pid);
      } else {
        // Contested — RNG decides
        const shuffled = [...claimants].sort(() => Math.random() - 0.5);
        const winnerId = shuffled[0];
        assignments[winnerId] = faction;
        assignedFactions.add(faction);
        unassignedPlayers.delete(winnerId);

        // Generate fate messages for each loser
        for (let i = 1; i < shuffled.length; i++) {
          const loserId = shuffled[i];
          const winner = playerMap.get(winnerId)!;
          const loser = playerMap.get(loserId)!;

          // Find the loser's next available preference
          const loserNextFaction = prefs[loserId]
            .slice(round + 1)
            .find((f) => f && !assignedFactions.has(f));

          fateMessages.push({
            winnerId,
            loserId,
            winnerName: winner.playerName,
            loserName: loser.playerName,
            winnerFaction: faction,
            loserFaction: loserNextFaction || "a faction chosen by fate",
            message: pickFateMessage(
              winner.playerName,
              loser.playerName,
              faction,
              loserNextFaction || "a faction chosen by fate",
            ),
          });
        }
      }
    }
  }

  // Any still-unassigned players get their next available preference or random
  for (const pid of unassignedPlayers) {
    const available = prefs[pid].find((f) => f && !assignedFactions.has(f));
    if (available) {
      assignments[pid] = available;
      assignedFactions.add(available);
    }
    // If all preferences taken, they'll need to be assigned later
  }

  return { assignments, fateMessages };
}

/**
 * Generate a shuffled draft order for N players.
 * Returns an array of indices [0..n-1] in random order.
 */
export function generateDraftOrder(playerCount: number): number[] {
  const order = Array.from({ length: playerCount }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Get the snake (inverse) draft order from a slice draft order.
 */
export function getSnakeOrder(draftOrder: number[]): number[] {
  return [...draftOrder].reverse();
}
