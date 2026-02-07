
## Show Faction Homeworld Data on Home Hexes

### Overview

When a faction is assigned to a home hex, replace the current "icon + name only" display with the faction's actual homeworld tile data -- showing planet names, resources, influence, and tech specialties using the same visual language as other tiles on the map.

### The Clutter Problem

The hex size is 38px. Currently, assigned home hexes show:
- Player nickname (top)
- Faction icon (24x24 center)
- Faction short name (below icon)
- Slice R/I stats badge (bottom edge)

Adding homeworld planets (1-3 planets per faction) into this space would overcrowd it. To solve this:

1. **Remove the slice R/I stats badge from home hexes** and move those stats to a slice summary displayed outside the map (a compact row below the map or in the sidebar).
2. **Shrink the faction icon** slightly to make room for planet info.
3. **Show homeworld planets** in a compact layout below the faction identity, using the existing `HexTileGraphics` planet rendering style but adapted for the tighter space.

### Data Addition: Faction Homeworld Mapping

A new data file (`src/lib/faction-homeworlds.ts`) will map each faction name to its homeworld `SystemTile`. This is canonical TI4 data. For example:

- The Arborec: Nestphar (2R/1I)
- The Federation of Sol: Jord (4R/2I)
- The Xxcha Kingdom: Archon Ren (2R/3I) + Archon Tau (1R/1I)
- The Titans of Ul: Elysium (4R/1I)

Each faction has 1-3 homeworld planets with known resources, influence, and optional tech specialties.

### Layout Changes on Home Hexes

When a faction is assigned, the home hex will show:

```text
+-------------------+
|  [Nickname]       |  (if set, small text)
|  [Faction Icon]   |  (shrunk to ~18x18)
|  [Short Name]     |  (small text)
|  ● Planet 3/1     |  (homeworld planets, compact)
|  ● Planet 2/2     |  (using colored dots like other tiles)
+-------------------+
```

For multi-planet homeworlds (2-3 planets), a compact stacked layout similar to the existing `TwoPlanetContent` / `ThreePlanetContent` but at a smaller scale.

### Slice Stats Relocation

The R/I totals currently shown on each home hex will be moved to the `SlicePanel` component (already exists in the sidebar for the map generator) or rendered as a compact summary row below the map in the lobby/profile views.

### Map Legend on Lobby and Profile Pages

The `MapLegend` component (currently only used on Map Generator and Create Game pages) will also be added to:
- **GameLobby** (`src/pages/GameLobby.tsx`): Below the map, inside the map container
- **GameDetailView** (`src/components/GameDetailView.tsx`): Below the map in the profile page's expanded game cards

---

### Files Changed

| File | Change |
|------|--------|
| `src/lib/faction-homeworlds.ts` | **New** -- Map of all 30 faction names to their homeworld `SystemTile` data (planets, R/I, tech) |
| `src/components/map/HexMapBoard.tsx` | Look up homeworld tile for assigned factions; pass to `HexTileGraphics` instead of returning `null` for home hexes; remove the R/I stats badge from home hexes; shrink faction icon; add compact planet display |
| `src/components/map/HexTileGraphics.tsx` | Add a new rendering mode for home-system tiles: accepts a `homeTile` prop and renders planets at a smaller scale alongside the faction identity |
| `src/pages/GameLobby.tsx` | Import and render `MapLegend` below the map |
| `src/components/GameDetailView.tsx` | Import and render `MapLegend` below the map |
| `src/components/map/MapLegend.tsx` | No changes needed |

### Technical Details

**`src/lib/faction-homeworlds.ts`** structure:
```typescript
import type { SystemTile } from "./map-data";

export const FACTION_HOMEWORLDS: Record<string, SystemTile> = {
  "The Arborec": {
    id: 5001, name: "Nestphar", resources: 2, influence: 1,
    type: "planet",
  },
  "The Federation of Sol": {
    id: 5006, name: "Jord", resources: 4, influence: 2,
    type: "planet",
  },
  "The Xxcha Kingdom": {
    id: 5015, name: "Archon Ren / Archon Tau",
    resources: 3, influence: 4, type: "planet",
    planets: [
      { name: "Archon Ren", resources: 2, influence: 3 },
      { name: "Archon Tau", resources: 1, influence: 1 },
    ],
  },
  // ... all 30 factions
};
```

**`src/components/map/HexMapBoard.tsx`** changes:
- Import `FACTION_HOMEWORLDS` from the new data file
- When rendering home hex with faction assigned: look up `FACTION_HOMEWORLDS[factionName]`
- Pass the homeworld tile to `HexTileGraphics` with a new `isHomeAssigned` flag
- Remove the `sliceStats` R/I badge block from home hexes
- Shrink faction icon from 24x24 to 18x18
- Adjust text positions to accommodate planet graphics below

**`src/components/map/HexTileGraphics.tsx`** changes:
- Update the early return: instead of `if (isCenter || isHome) return null`, check `if (isCenter) return null` and handle home hexes with a new compact layout
- Add a new prop `homeTile?: SystemTile` that provides the homeworld data
- When `isHome && homeTile`, render a compact planet display below the faction identity area, using smaller planet graphics (radius 3-4 instead of 5-7) and smaller text

**Lobby and Profile MapLegend placement:**
- `GameLobby.tsx`: Add `<MapLegend />` inside the map container div, after the `HexMapBoard`
- `GameDetailView.tsx`: Add `<MapLegend />` after the `HexMapBoard`, inside the map container
