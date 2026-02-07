

# Multiplayer Game Lobby with Ranked Choice Faction Draft and Snake Draft

## Overview

This plan transforms the current single-player Map Generator into a full multiplayer game lobby system. The host creates a game with a generated map, shares a URL, and players join to draft factions, slices, and strategy cards across three sequential phases -- all synchronized in real time.

---

## What You'll Experience

### As the Host
1. Go to **"Create Game"** (renamed from "Map")
2. Pick player count, generate and balance a map
3. Click **"Create Game"** -- saves to database, generates a shareable URL
4. Share that URL with your friends
5. Watch players join, then the draft begins automatically

### As a Player
1. Open the shared game URL
2. Log in (or create an account)
3. **Phase 1 -- Faction Draft**: Rank your top 3 faction choices. Once everyone has submitted, ties are resolved with ranked-choice runoff. If two players rank the same faction equally, fate (RNG) decides with a funny message like: *"Fate has decreed that Alex shall command The Xxcha Kingdom. Sorry Jordan -- RNGesus has chosen The Winnu for you instead."*
4. **Phase 2 -- Slice Draft**: Pick your starting slice in a randomized sequential order. Each pick requires confirmation: *"Final answer -- this can't be changed once the next selection is made."*
5. **Phase 3 -- Strategy Draft**: Pick your strategy card in reverse (snake) order of the slice draft.
6. **Game Ready**: View the final board with all assignments.

### As a Spectator
- Anyone with the link can view the game lobby read-only without logging in
- See the map, joined players, and all draft results as they happen
- Cannot make any selections

---

## Draft Mechanics in Detail

### Phase 1: Ranked Choice Faction Draft (Simultaneous)

Every player submits their top 3 faction preferences in order:
- **Choice 1** = most wanted, **Choice 2** = backup, **Choice 3** = fallback
- Once ALL players have locked in, the system resolves assignments:
  1. Process Choice 1 for all players. If a faction is only wanted by one player, they get it.
  2. If multiple players have the same Choice 1, run instant-runoff: compare their next-ranked choice. If still tied at all ranks, RNG breaks it.
  3. The "loser" of each conflict gets their next available ranked choice.
  4. Display a themed message for each RNG resolution.
- Each player confirms their result before the lobby advances.

### Phase 2: Slice Draft (Sequential, Random Order)

- The system generates a random draft order (e.g., Player 3 -> Player 1 -> Player 4 -> Player 2)
- Players pick in turn order. The UI highlights whose turn it is.
- After selecting, a confirmation dialog appears: "Final answer -- this can't be changed once the next selection is made: Yes / No"
- The selection remains editable until the player confirms, at which point the next player's turn begins.
- Auto-advances to Phase 3 when the last slice is confirmed.

### Phase 3: Strategy Draft (Sequential, Inverse/Snake Order)

- Turn order is the **reverse** of the slice draft order (snake draft)
  - Example: If slice order was [3, 1, 4, 2], strategy order is [2, 4, 1, 3]
- Each player picks one of the 8 strategy cards (Leadership, Diplomacy, Politics, Construction, Trade, Warfare, Technology, Imperial)
- Strategy card details are shown inline for reference
- Same confirmation flow as slice draft
- Auto-advances to "Game Ready" when complete

---

## Page Changes

### Home ("/") becomes "Codex"
- Shows only the AI chatbot (ChatInterface)
- NavLink label changes from "Home" to "Codex"
- The FactionSelector component is removed from this page (it moves to the game lobby)

### Map ("/map") becomes "Create Game" ("/game/new")
- Same map generation tools (player count, tile banks, balance, regenerate)
- Removes slice assignment panel (that's now part of the lobby draft)
- Adds a "Create Game" button that saves to the database and redirects to `/game/{id}`
- The old `/map` route redirects to `/game/new` for backwards compatibility
- Import and share-by-URL features remain for standalone map viewing

### New: Game Lobby ("/game/:id")
- The central multiplayer page
- Shows the hex map (read-only, rendered from saved map_string)
- Player list sidebar showing who has joined, whose turn it is
- Phase-specific panels: faction ranking form, slice picker, strategy picker
- Real-time updates via database realtime subscriptions
- Spectators see everything but have no interactive controls

### New: Strategy Card Reference
- Embedded within the game lobby's strategy draft phase
- Shows card number, name, primary ability, and secondary ability for each of the 8 cards
- Also accessible as a standalone reference section

---

## Technical Details

### Database Schema Changes

**`games` table -- new columns:**
- `status` (text, NOT NULL, default `'setup'`): One of `setup`, `faction_draft`, `slice_draft`, `strategy_draft`, `ready`
- `draft_order` (integer array, nullable): The randomized player order for slice selection, stored as `[2,0,3,1]`

**`game_players` table -- new columns:**
- `strategy_card` (integer, nullable): The chosen strategy card number (1-8)
- `draft_position` (integer, nullable): This player's position in the slice draft order
- `joined_at` (timestamptz, default now()): When they joined the lobby
- `faction_pref_1` (text, nullable): First choice faction name
- `faction_pref_2` (text, nullable): Second choice faction name
- `faction_pref_3` (text, nullable): Third choice faction name
- `faction_locked` (boolean, default false): Whether the player has submitted their faction preferences

**RLS policy updates:**
- Any authenticated user can VIEW games and game_players (for joining and spectating)
- Authenticated users can INSERT themselves into game_players (join a game)
- Players can UPDATE their own row (picks and preferences)
- Host can UPDATE game status and draft_order
- Existing restrictive policies for owner-only operations remain

**Realtime:**
- Enable realtime on both `games` and `game_players` tables so all connected clients see live draft updates

### New Files

| File | Purpose |
|------|---------|
| `src/lib/strategy-cards.ts` | Data for the 8 TI4 strategy cards (number, name, primary ability, secondary ability) |
| `src/pages/CreateGame.tsx` | Refactored from MapGenerator -- map gen tools + "Create Game" button |
| `src/pages/GameLobby.tsx` | The multiplayer draft lobby page with realtime sync |
| `src/components/game/FactionDraftPanel.tsx` | UI for ranking top 3 faction preferences |
| `src/components/game/SliceDraftPanel.tsx` | UI for sequential slice picking with confirmation |
| `src/components/game/StrategyDraftPanel.tsx` | UI for sequential strategy card picking |
| `src/components/game/StrategyCardInfo.tsx` | Reference card showing strategy card details |
| `src/components/game/PlayerList.tsx` | Shows joined players, turn indicators, draft status |
| `src/components/game/DraftConfirmDialog.tsx` | "Final answer" confirmation dialog reused across phases |
| `src/components/game/FateMessage.tsx` | Animated display for RNG resolution messages |
| `src/lib/draft-resolver.ts` | Logic for ranked-choice resolution and RNG tiebreaking |

### Modified Files

| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes: `/game/new`, `/game/:id`. Redirect `/map` to `/game/new` |
| `src/components/TopNav.tsx` | Rename "Home" to "Codex", rename "Map" to "Create Game", update paths |
| `src/pages/Index.tsx` | Already just the chatbot -- no changes needed |
| `src/pages/Profile.tsx` | Update "Go to Map Generator" link to point to `/game/new` |
| `src/pages/MapGenerator.tsx` | Renamed/replaced by `CreateGame.tsx` |

### Draft Resolution Logic (src/lib/draft-resolver.ts)

```text
Input: Array of players, each with [pref1, pref2, pref3]

Algorithm:
1. Build a map: faction -> list of players who ranked it #1
2. For each faction with exactly one claimant: assign it, remove player from pool
3. For each faction with multiple claimants:
   a. Compare their rank for this faction (all rank 1 at this point since we process round by round)
   b. Check if one player has it ranked higher than others -- if so, they win
   c. If tied at same rank: random selection
   d. Winner gets the faction
   e. Loser falls through to their next available preference
4. Repeat until all players assigned
5. Return assignments + list of "fate messages" for any RNG resolutions

Output: 
  - assignments: { playerId: factionName }
  - fateMessages: [{ winner, loser, winnerFaction, loserFaction, message }]
```

### Realtime Subscription Pattern

```text
GameLobby subscribes to:
  - games table (filter: id = current game) -- for status changes
  - game_players table (filter: game_id = current game) -- for joins and picks

On each change:
  - Re-fetch full game state
  - Determine current phase, whose turn it is
  - Update UI accordingly
  - Auto-advance phase when all picks are complete
```

### Implementation Sequence

**Phase A -- Foundation**
1. Database migration: add new columns to `games` and `game_players`, update RLS, enable realtime
2. Create `src/lib/strategy-cards.ts` with the 8 strategy card data
3. Create `src/lib/draft-resolver.ts` with ranked-choice resolution logic
4. Rename navigation labels in TopNav ("Codex", "Create Game")

**Phase B -- Create Game Flow**
5. Build `CreateGame.tsx` (adapted from MapGenerator) with "Create Game" button
6. Update `App.tsx` routes: `/game/new`, `/game/:id`, redirect `/map`
7. Update Profile page links

**Phase C -- Game Lobby**
8. Build `GameLobby.tsx` with realtime subscriptions and phase management
9. Build `PlayerList.tsx` component
10. Build `FactionDraftPanel.tsx` with ranked choice UI
11. Build `DraftConfirmDialog.tsx` for "Final answer" confirmations
12. Build `FateMessage.tsx` for animated RNG resolution messages
13. Build `SliceDraftPanel.tsx` with sequential turn-based picking
14. Build `StrategyCardInfo.tsx` and `StrategyDraftPanel.tsx`

**Phase D -- Polish**
15. Spectator mode (read-only view for non-participants)
16. Handle edge cases (player leaves, host disconnects, partial drafts)
17. Mobile-responsive layout for the lobby

