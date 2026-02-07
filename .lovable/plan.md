

## Quick Prompt Button Layout Update

### Goal
Rearrange the quick prompt buttons so the icon and title sit on the same row, freeing vertical space to increase the prompt text size.

### Current Layout
```text
[Icon]
LABEL
prompt text (text-xs, line-clamp-2)
```

### Proposed Layout
```text
[Icon] LABEL
prompt text (text-sm, line-clamp-3)
```

### Changes

**File: `src/components/QuickPrompts.tsx`** (single file change)

1. **Icon + Label row**: Change the button's inner layout from `flex-col` to keep `flex-col` overall, but wrap the icon and label in a horizontal `flex items-center gap-2` row so they sit side by side.

2. **Increase prompt text size**: Change the prompt text from `text-xs` to `text-sm` and update the line clamp from `line-clamp-2` to `line-clamp-3` to show more of the prompt.

3. **Minor spacing**: Adjust the gap between the header row and the prompt text to keep things visually balanced.

### Technical Details

- The button's outer container keeps `flex flex-col` for stacking the header row above the prompt text
- A new inner `div` with `flex items-center gap-2` wraps the icon and label span
- The label span keeps its existing styling (`font-display text-xs tracking-wider uppercase`)
- The prompt span gets bumped from `text-xs` to `text-sm` and `line-clamp-2` to `line-clamp-3`

