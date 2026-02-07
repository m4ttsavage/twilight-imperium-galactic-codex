

## Add Game Names, Map Export, and Lobby Links

### 1. Random Space-Themed Game Name

Each game gets a randomly generated 4-word name at creation time (e.g., "Galactic Frozen Pickle Monsoon"). The name is generated client-side from curated word lists that are space-themed and free of inappropriate language.

**Word list structure** (new file `src/lib/game-names.ts`):
- 4 word pools, each containing 40-60 safe, space-themed words
- Pool 1 (adjectives): galactic, stellar, cosmic, nebular, frozen, crimson, ancient, orbital, radiant, phantom, etc.
- Pool 2 (adjectives): blazing, silent, drifting, shattered, hollow, molten, winding, volatile, etc.
- Pool 3 (nouns): pickle, comet, beacon, citadel, monsoon, vortex, pulsar, eclipse, titan, nova, etc.
- Pool 4 (nouns): crusade, summit, rift, tempest, exodus, cascade, dominion, frontier, armada, etc.
- A `generateGameName()` function picks one random word from each pool and joins them

**Database change**: Add a `name` column to the `games` table:
```sql
ALTER TABLE public.games ADD COLUMN name text;
```
This is nullable so existing games remain valid.

**Where the name is generated and stored**:
- In `CreateGame.tsx`: call `generateGameName()` and include `name` in the insert
- In `SaveGameDialog.tsx` (if it creates games): also include the name

**Where the name is displayed**:
- **Game Lobby header**: Show the game name prominently above/beside the map, next to the status pill
- **Profile page / GameHistoryCard**: Replace the generic "6p Game" title with the game name (fall back to "6p Game" for older games without a name)

### 2. Export Map String Button on Lobby Page

Add a "Copy Map" / "Export" button to the lobby page that copies the game's `map_string` to the clipboard -- using the same clipboard + toast pattern as the Create Game page's export button.

**Location**: In the lobby header, next to the existing "Share Link" button.

### 3. Profile Game Cards Link to Lobby

Each game history card on the profile page will link directly to its lobby page (`/game/{id}`). 

**Changes to `GameHistoryCard`**:
- Add game `id` to the component's `Game` interface (already present)
- Add a "View Lobby" button in the expanded card footer, or make the card header itself link to the lobby
- Replace (or supplement) the "Open in Generator" button with a "View in Lobby" button using `navigate(/game/${game.id})`

---

### Summary of Files Changed

| File | Change |
|------|--------|
| `src/lib/game-names.ts` | **New** -- Word lists and `generateGameName()` function |
| `src/pages/CreateGame.tsx` | Generate and store game name on creation |
| `src/components/SaveGameDialog.tsx` | Generate and store game name on save (if applicable) |
| `src/pages/GameLobby.tsx` | Display game name in header; add Export Map button; update `GameData` interface to include `name` |
| `src/components/GameHistoryCard.tsx` | Display game name instead of generic title; add "View in Lobby" link; keep "Open in Generator" as secondary option |
| `src/pages/Profile.tsx` | No changes needed -- `GameHistoryCard` handles the linking |

### Technical Details

**Database migration**:
```sql
ALTER TABLE public.games ADD COLUMN name text;
```
No RLS changes needed -- existing policies cover read/write of the new column.

**`src/lib/game-names.ts`** structure:
```typescript
const POOL_1 = ["Galactic", "Stellar", "Cosmic", ...];
const POOL_2 = ["Frozen", "Blazing", "Silent", ...];
const POOL_3 = ["Pickle", "Comet", "Beacon", ...];
const POOL_4 = ["Monsoon", "Crusade", "Summit", ...];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateGameName(): string {
  return `${pick(POOL_1)} ${pick(POOL_2)} ${pick(POOL_3)} ${pick(POOL_4)}`;
}
```

**Lobby header layout** -- game name displayed as a secondary heading under "Game Lobby":
```
Game Lobby
Galactic Frozen Pickle Monsoon  |  6 players  [In Progress]
```

**GameHistoryCard collapsed row** -- game name replaces "6p Game":
```
[icon] Galactic Frozen Pickle Monsoon   Jan 15, 2026
       [trophy] The Federation of Sol (Alex) -- 10 VP
```
Falls back to `{game.player_count}p Game` when `game.name` is null.

**Export button in lobby** -- reuses the same Copy icon + toast pattern from CreateGame:
```typescript
const handleExportMap = () => {
  navigator.clipboard.writeText(game.map_string).then(() => {
    toast.success("Map string copied to clipboard");
  });
};
```

**View in Lobby button** in GameHistoryCard:
```typescript
<Link to={`/game/${game.id}`} className="...">
  <Gamepad2 className="w-3 h-3" />
  View in Lobby
</Link>
```

