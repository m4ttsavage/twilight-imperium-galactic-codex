

## Add "Complete Game" Flow to the Lobby

### Current Game Status Values

The game progresses through these statuses (stored in `games.status`):

| Status | Label | Meaning |
|--------|-------|---------|
| `setup` | Setting Up | Host is configuring the game, players joining |
| `faction_draft` | Faction Draft | Players submit ranked faction preferences |
| `slice_draft` | Slice Draft | Players pick map slices in draft order |
| `strategy_draft` | Strategy Draft | Players pick strategy cards in snake order |
| `ready` | Game Ready | All drafting complete, game can begin on the table |

There is **no "completed" status** yet. The `game_players` table already has `placement` (integer) and `victory_points` (integer) columns, but they are never populated from the lobby -- they're only displayed on the Profile page's history cards.

---

### What This Plan Adds

1. **A new `complete` status** for games that have finished being played
2. **A "Complete Game" button** on the lobby page (host-only), visible when the game is in `ready` status
3. **A results entry form** where the host can enter each player's final placement and victory points, plus optional game notes
4. **A completed game summary view** shown to all players when the game status is `complete`
5. **Updated status label** in the lobby header badge

---

### Detailed Changes

**File: `src/pages/GameLobby.tsx`**

- Add `complete` to the `statusLabel` map: `complete: "Completed"`
- Import the new `GameResultsPanel` component
- Add a `handleCompleteGame` function that:
  - Receives an array of `{ playerId, placement, victoryPoints }` and optional notes
  - Updates each `game_player` row with `placement` and `victory_points`
  - Updates the `games` row with `status: "complete"` and optionally `notes`
- In the sidebar, when `game.status === "ready"` and `isHost`, show a "Complete Game" button that reveals the results entry form
- When `game.status === "complete"`, show the completed game summary (replaces the "Game Ready" panel)

**New file: `src/components/game/GameResultsPanel.tsx`**

A host-only form for entering post-game results:
- Lists each player with their faction icon and nickname
- For each player: a placement dropdown (1st through Nth) and a VP number input
- A text area for optional game notes
- Validation: all placements must be filled, no duplicate placements (ties allowed optionally)
- A "Finalize Results" button with a confirmation dialog (results are permanent)
- Props: `players`, `onSubmit(results, notes)`

**New file: `src/components/game/GameCompleteSummary.tsx`**

A read-only summary panel shown to everyone when game status is `complete`:
- Shows a standings table (sorted by placement) with faction, player name, and VP
- Shows game notes if present
- Similar visual style to the standings table in `GameHistoryCard`
- Trophy icon for the winner

**File: `src/components/game/PlayerList.tsx`**

- Add `placement` and `victory_points` to the `GamePlayerInfo` interface
- When game status is `complete`, show placement badge and VP next to each player

---

### Technical Details

**Database:** No schema changes needed. The `game_players` table already has `placement` (integer, nullable) and `victory_points` (integer, nullable) columns. The `games` table already has `notes` (text, nullable) and `status` (text) columns that accept any string value.

**RLS:** No policy changes needed. The existing "Host can update their own game" policy covers updating status and notes. The "Hosts can update their game players" and "Players can update own draft picks" policies cover updating placement/VP.

**File: `src/pages/GameLobby.tsx`** -- status label map update:
```
const statusLabel: Record<string, string> = {
  setup: "Setting Up",
  faction_draft: "Faction Draft",
  slice_draft: "Slice Draft",
  strategy_draft: "Strategy Draft",
  ready: "Game Ready",
  complete: "Completed",
};
```

**File: `src/components/game/GameResultsPanel.tsx`** -- new component structure:
- Input state: array of `{ playerId: string, placement: number | null, vp: number | null }` initialized from players list
- Notes textarea state
- Placement select per player (1 through playerCount)
- VP number input per player (0-99)
- Submit handler validates all placements are set, calls `onSubmit`
- Uses AlertDialog for "Finalize" confirmation

**File: `src/components/game/GameCompleteSummary.tsx`** -- new component:
- Receives `players` (with placement/VP filled) and `notes`
- Renders a standings table sorted by placement
- Winner row highlighted with gold accent
- Trophy icon and "Game Complete" heading

### Summary of Files Changed

| File | Change |
|------|--------|
| `src/pages/GameLobby.tsx` | Add `complete` status, result submission handler, render new panels |
| `src/components/game/GameResultsPanel.tsx` | New -- host form for entering placement + VP per player |
| `src/components/game/GameCompleteSummary.tsx` | New -- read-only completed game summary with standings |
| `src/components/game/PlayerList.tsx` | Add placement/VP to interface, show badges when complete |

