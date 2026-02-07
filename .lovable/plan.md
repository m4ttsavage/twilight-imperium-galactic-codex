

## Larger, More Readable Map Tiles + Compact Legend Layout

### Overview

Two improvements to the Map Generator (and Create Game) pages:

1. **Make the hex map larger and zoomable** so tile text is easier to read
2. **Compress the map legend** into a tighter grid and position it beside the map when space allows

---

### 1. Larger, Zoomable Hex Map

**Current state:** The SVG has `maxHeight: "70vh"` which caps how big it renders, and `HEX_SIZE = 38` controls the internal coordinate scale. Since it's an SVG with a computed viewBox, the text inside scales proportionally -- so the key constraint is the CSS `maxHeight` limiting how much screen space the map occupies.

**Changes to `HexMapBoard.tsx`:**

- Remove the `maxHeight: "70vh"` cap so the SVG can grow taller on large screens
- Add a wrapper `div` with `overflow: auto` and mouse-wheel zoom support using a `transform: scale()` state variable
- Implement pinch-to-zoom on touch devices and scroll-wheel zoom on desktop
- Add zoom controls (+ / - buttons and a reset) in the corner of the map container
- The zoom level will be stored in React state, applied as a CSS transform on an inner wrapper around the SVG
- Default zoom will be 1x, with a range of roughly 0.5x to 2x
- The SVG's `maxHeight` will be changed to `85vh` as a new default (giving ~20% more space), and zooming beyond that uses scroll overflow

**Changes to `MapGenerator.tsx` and `CreateGame.tsx`:**

- The map + legend will be wrapped in a new flex layout (details in section 2 below)

---

### 2. Compact Legend + Side Placement

**Current state:** The `MapLegend` component renders as a vertical stack of sections (Tech, Anomalies, Wormholes, Slice Stats), each with a section header and a horizontal `flex-wrap` row of items. This wastes horizontal space -- on desktop the legend is ~200px tall but only uses maybe 40% of the available width.

**Changes to `MapLegend.tsx`:**

- Restructure the legend into a dense grid layout:
  - Combine the section headers inline with their items rather than stacking vertically
  - Use a CSS grid with 2-4 columns so all legend categories sit in a compact block
  - On desktop (when placed beside the map), the legend will be a narrow vertical column (~200-250px wide) with items stacked compactly
  - On mobile (when placed below the map), it falls back to the current horizontal-wrap style

**Changes to the map container layout in `MapGenerator.tsx` and `CreateGame.tsx`:**

- Wrap the map card and legend in a responsive flex container:
  - On large screens (lg+): `flex-row` with the map taking the majority of space and the legend as a narrow sidebar to the right
  - On smaller screens: `flex-col` with the legend below the map (current behavior)
- The legend sidebar will be approximately 220px wide with `flex-shrink-0`

---

### Technical Details

**File: `src/components/map/HexMapBoard.tsx`**
- Add `useState` for zoom level (default 1, range 0.5-2.0)
- Wrap the SVG in a container `div` with `overflow: auto`, `position: relative`
- Apply `transform: scale(zoomLevel)` and `transform-origin: top center` on an inner wrapper
- Add `onWheel` handler: Ctrl+scroll or pinch adjusts zoom by 0.1 increments
- Add small floating zoom buttons (+ / - / reset) absolutely positioned in top-right corner of the map container
- Change the SVG style from `maxHeight: "70vh"` to `maxHeight: "85vh"`

**File: `src/components/map/MapLegend.tsx`**
- Accept an optional `compact` prop (boolean, default false)
- When `compact` is true (used in sidebar mode): render as a narrow vertical list with smaller spacing
- When false (below map on mobile): keep current horizontal wrap layout
- Remove the per-section vertical `space-y` gap, use tighter `gap-1` throughout

**File: `src/pages/MapGenerator.tsx`** (lines ~286-296)
- Replace the current map + legend wrapper:
  ```
  <div className="flex flex-col lg:flex-row gap-3">
    <div className="flex-1 min-w-0 rounded-xl border ...">
      <HexMapBoard ... />
    </div>
    <div className="lg:w-56 flex-shrink-0">
      <MapLegend compact={isDesktop} />
    </div>
  </div>
  ```
- Use a simple media query check or `useIsMobile()` hook (already exists) to determine `compact` mode

**File: `src/pages/CreateGame.tsx`** (lines ~400-407)
- Same layout pattern as MapGenerator for map + legend side-by-side

### Summary of Files Changed

| File | Change |
|------|--------|
| `src/components/map/HexMapBoard.tsx` | Add zoom controls, remove 70vh cap, add scroll overflow wrapper |
| `src/components/map/MapLegend.tsx` | Add `compact` prop, tighter grid layout for sidebar mode |
| `src/pages/MapGenerator.tsx` | Side-by-side flex layout for map + legend on desktop |
| `src/pages/CreateGame.tsx` | Same side-by-side layout |
