

# Add Display Name to Profile and Searchable Faction Selectors

## Overview
Two connected features: (1) let you set a display name on your profile that auto-fills as your player nickname on the Codex page, and (2) add typeahead/search filtering to all faction selection areas across the app.

---

## Part 1: Display Name on Profile

The `profiles` table already has a `display_name` column. We just need to wire it up.

**Profile page (`src/pages/Profile.tsx`)**
- Fetch the user's `display_name` from the `profiles` table on load
- Show an editable name field below the email, with a save button
- On save, upsert the profile row with the new display name
- Show the display name in the header alongside the email

**Auto-fill on Codex page (`src/components/ChatInterface.tsx` / `src/components/FactionSelector.tsx`)**
- When the user selects "My Faction" and is logged in, auto-populate the nickname field with their `display_name` from the profiles table
- The user can still override it manually
- This uses the existing `nicknames` state and `NicknameInput` component

**Implementation**: Create a small `useProfile` hook that fetches and caches the display name, reusable across pages.

---

## Part 2: Searchable Faction Selectors

There are 4 places that need search/typeahead for faction selection:

### 2a. Codex Page FactionSelector (`src/components/FactionSelector.tsx`)
- Add a search input at the top of the faction grid (inside the dropdown)
- Filter the `FactionList` items by search query matching faction name or short name
- Works for both "My Faction" and "Opponents" tabs

### 2b. Create Game -- Host Setup Panel (`src/components/game/HostSetupPanel.tsx`)
- Replace the plain `<select>` for faction with a custom searchable dropdown
- Create a reusable `FactionSearchSelect` component that shows a text input with filtered dropdown results, faction icons, and expansion grouping
- Same visual style as the existing `FactionCompareSelector` (which already has search)

### 2c. Game Lobby -- Faction Draft Panel (`src/components/game/FactionDraftPanel.tsx`)
- Replace the 3 plain `<select>` elements (1st/2nd/3rd choice) with the same `FactionSearchSelect` component
- Maintains the existing exclude logic (can't pick the same faction twice)

### 2d. Map Page -- Faction Picker Dialog (`src/components/map/FactionPickerDialog.tsx`)
- Add a search bar at the top of the grid dialog
- Filter the icon grid by search query

---

## New Shared Component

**`src/components/FactionSearchSelect.tsx`** -- A reusable searchable faction dropdown:
- Text input with search icon
- Dropdown list filtered by name/shortName
- Shows faction icon + name for each option
- Supports excluding already-used factions (disabled/hidden)
- Handles selection and clear
- Styled consistently with the app's design system (dark theme, font-display labels, etc.)

---

## Technical Details

### New files
- `src/hooks/useProfile.ts` -- Fetches and updates `display_name` from the profiles table
- `src/components/FactionSearchSelect.tsx` -- Reusable searchable faction picker

### Modified files
1. **`src/pages/Profile.tsx`** -- Add display name field with save functionality
2. **`src/components/ChatInterface.tsx`** -- Use `useProfile` hook to get display name, pass it to FactionSelector
3. **`src/components/FactionSelector.tsx`** -- Accept optional `defaultNickname` prop for auto-fill; add search input to faction list
4. **`src/components/game/HostSetupPanel.tsx`** -- Replace faction `<select>` with `FactionSearchSelect`
5. **`src/components/game/FactionDraftPanel.tsx`** -- Replace faction `<select>` elements with `FactionSearchSelect`
6. **`src/components/map/FactionPickerDialog.tsx`** -- Add search input above the faction icon grid

### No database changes needed
The `profiles` table already has `display_name` with appropriate RLS policies (users can read/write their own profile).

