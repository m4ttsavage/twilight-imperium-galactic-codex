

# Add "Host Chooses" Mode to Game Setup

## Overview

This adds a toggle on the Create Game page that lets the host choose between two setup modes:

- **Players Choose** (existing behavior) -- players join via URL and go through the faction draft, slice draft, and strategy draft phases.
- **Host Chooses** -- the host manually assigns all players (names and emails), factions, slices, and strategy cards before creating the game. The game is created in the "ready" state, skipping all draft phases entirely.

---

## What You'll See

### On the Create Game Page

After generating a map, the host sees a new toggle/selector:

```
Setup Mode:  [Players Choose]  [Host Chooses]
```

When **Host Chooses** is selected, a new panel appears below the map with:

1. **Player Rows** -- One row per player slot (based on the selected player count). Each row has:
   - Name input (required)
   - Email input (optional -- used to link the player to their account if they have one)
   - Faction dropdown (select from all available factions)
   - Slice dropdown (select A, B, C, etc.)
   - Strategy card dropdown (select from the 8 strategy cards)

2. **Validation** -- The "Create Game" button is disabled until:
   - Every player has a name
   - Every player has a unique faction assigned
   - Every player has a unique slice assigned
   - Every player has a unique strategy card assigned

3. **Create Game** -- When clicked, saves the game with status "ready" and inserts all game_players with their full assignments. The host is redirected to the Game Lobby which shows the final board.

### On the Game Lobby Page

Games created in "Host Chooses" mode show up in the "Game Ready" state immediately. The map displays all assigned factions and player names on their homeworld tiles. No draft UI is shown.

---

## Database Changes

A new column on the `games` table:

- `setup_mode` (text, NOT NULL, default `'players_choose'`): Either `'players_choose'` or `'host_chooses'`

This column is used to distinguish how the game was created, which can be useful for the lobby display (e.g., showing "Setup by host" vs. "Drafted by players").

Additionally, the existing RLS policy "Users can insert their game players" (`is_game_owner(game_id)`) already allows the host to insert game_players rows on behalf of other players, so no RLS changes are needed.

---

## Technical Details

### New Component

**`src/components/game/HostSetupPanel.tsx`**

A form panel rendered on the Create Game page when "Host Chooses" mode is selected. Contains:
- A list of player rows (one per player count)
- Each row: name input, email input, faction select, slice select, strategy card select
- Validation logic to prevent duplicates across rows
- Returns the complete player assignments to the parent

### Modified Files

**`src/pages/CreateGame.tsx`**
- Add a `setupMode` state: `'players_choose' | 'host_chooses'`
- Render a toggle/selector for the mode
- When `host_chooses`, render `HostSetupPanel` below the map
- When `host_chooses`, the `handleCreateGame` function:
  - Creates the game with `status: 'ready'` and `setup_mode: 'host_chooses'`
  - Inserts all game_players rows with faction, slice, and strategy card pre-filled
  - Sets `player_user_id` to null for non-host players (the `resolve_player_user_on_insert` trigger will auto-link by email if matched)
  - The host's own row uses their `user.id` as `player_user_id`

**`src/pages/GameLobby.tsx`**
- Add `setup_mode` to the `GameData` interface
- Minor display tweak: if `setup_mode === 'host_chooses'`, the status label can say "Game Ready (Host Setup)" or similar

**`src/components/game/PlayerList.tsx`**
- No functional changes needed -- it already displays faction, strategy card, and nicknames from the data

### Database Migration

```sql
ALTER TABLE games
  ADD COLUMN setup_mode text NOT NULL DEFAULT 'players_choose';
```

### Validation Rules (Client-Side)

- No two players can have the same faction
- No two players can have the same slice index
- No two players can have the same strategy card
- Every player must have a name
- Faction, slice, and strategy selections are all required before the "Create Game" button enables

### Data Flow for Host Chooses

```text
1. Host generates map (e.g., 4 players)
2. Host selects "Host Chooses" mode
3. Host fills in 4 player rows:
   - Player 1: "Alice", alice@email.com, Sol, Slice A, Leadership
   - Player 2: "Bob", bob@email.com, Hacan, Slice B, Trade
   - Player 3: "Carol", carol@email.com, Xxcha, Slice C, Diplomacy
   - Player 4: "Dave", dave@email.com, L1Z1X, Slice D, Warfare
4. Host clicks "Create Game"
5. System creates:
   - games row: status='ready', setup_mode='host_chooses'
   - 4 game_players rows with all fields populated
   - Host's row (matching email) gets player_user_id set
   - Other rows get player_user_id auto-resolved via trigger
6. Redirect to /game/{id} showing the completed board
```

### Implementation Sequence

1. Database migration: add `setup_mode` column to `games`
2. Create `HostSetupPanel.tsx` component with the player assignment form
3. Update `CreateGame.tsx` with the mode toggle and conditional rendering
4. Update `GameLobby.tsx` to include `setup_mode` in `GameData`

