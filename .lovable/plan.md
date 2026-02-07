

## Game Name UI Improvements and Backfill

### What This Does

1. **Relocate the game name** in the Game Lobby header so it appears to the right of the status badge instead of above it on a separate line.
2. **Add a "Game Name" label** above the name text for clarity.
3. **Add a regenerate icon** (refresh/dice icon) next to the game name that lets the host generate a new random name and save it to the database.
4. **Backfill existing games** that have no name by running a one-time data update.

### Changes

#### 1. Game Lobby Header Layout (src/pages/GameLobby.tsx)

Currently the header subtitle line shows: `[game name] [player count] [status badge]`

Updated layout will be:

```text
Game Lobby
[player count]  [STATUS BADGE]  |  Game Name: Galactic Frozen Pickle Monsoon [refresh icon]
```

- Move the game name to appear after the status badge, separated visually.
- Add a small "Game Name" label in front of the name text.
- Add a `RefreshCw` (or `Dices`) icon button next to the name -- only visible to the host.
- Clicking the icon generates a new name via `generateGameName()` and saves it to the database with `supabase.from("games").update({ name: newName })`.
- Import `RefreshCw` from lucide-react and `generateGameName` from the game-names lib.
- Add a `handleRegenerateName` async function that generates a new name, updates the DB, and refreshes local state via `setGame(...)`.

#### 2. Backfill Existing Games (Database)

There are 3 games in the database with no name. Since the name generation logic lives in client-side JavaScript (not SQL), we have two options:

- **Option A**: Generate names client-side and run 3 UPDATE statements via the data insert tool.
- **Option B**: Create a simple SQL function using `md5(random()::text)` to generate a placeholder name.

We'll go with **Option A** -- generate 3 random names and update each game row directly. The names will follow the same 4-word pattern.

Games to update:
- `744b1164-aef6-4f2e-afce-eb7df121de35`
- `c81f0485-4060-4271-b0e2-b5f035182e26`
- `eb98d647-9041-4c4f-aff7-5844f7f4144c`

---

### Technical Details

**File: src/pages/GameLobby.tsx**
- Add imports: `RefreshCw` from lucide-react, `generateGameName` from `@/lib/game-names`
- Add `handleRegenerateName` function:
  - Calls `generateGameName()` to get a new name
  - Updates the DB: `supabase.from("games").update({ name }).eq("id", gameId)`
  - Updates local state: `setGame(prev => prev ? { ...prev, name } : prev)`
  - Shows a toast confirmation
- Restructure the subtitle row in the header:
  - Player count and status badge stay on the left
  - Game name moves to after the status badge with a "Game Name" label
  - Refresh icon button appears next to the name (host only)

**Database updates (3 rows)**:
- Generate a name for each of the 3 games missing one using the same word pool pattern

