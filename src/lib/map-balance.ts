import type { GeneratedMap, SystemTile } from "./map-data";

function computeSliceStats(map: GeneratedMap) {
  return Array.from({ length: map.playerCount }, (_, i) => {
    const sh = map.hexes.filter((h) => h.sliceIndex === i && !h.isHome);
    return {
      resources: sh.reduce((s, h) => s + h.tile.resources, 0),
      influence: sh.reduce((s, h) => s + h.tile.influence, 0),
      tileCount: sh.length,
    };
  });
}

export function improveBalance(
  map: GeneratedMap,
  metric: "resources" | "influence" | "total",
): GeneratedMap {
  // Deep clone hexes and tiles
  const hexes = map.hexes.map((h) => ({ ...h, tile: { ...h.tile } }));
  const newMap: GeneratedMap = { ...map, hexes, sliceStats: [] };

  const getMetricValue = (tile: SystemTile) => {
    if (metric === "resources") return tile.resources;
    if (metric === "influence") return tile.influence;
    return tile.resources + tile.influence;
  };

  for (let pass = 0; pass < 40; pass++) {
    // Group swappable hex indices by slice
    const sliceHexIndices: number[][] = Array.from(
      { length: map.playerCount },
      () => [],
    );
    hexes.forEach((h, idx) => {
      if (!h.isHome && !h.isCenter && h.sliceIndex >= 0) {
        sliceHexIndices[h.sliceIndex].push(idx);
      }
    });

    // Calculate slice totals
    const totals = sliceHexIndices.map((indices) =>
      indices.reduce((sum, idx) => sum + getMetricValue(hexes[idx].tile), 0),
    );
    const maxVal = Math.max(...totals);
    const minVal = Math.min(...totals);

    if (maxVal - minVal <= 1) break;

    const maxSlice = totals.indexOf(maxVal);
    const minSlice = totals.indexOf(minVal);

    // Find the best swap that reduces the gap
    let bestA = -1;
    let bestB = -1;
    let bestNewGap = Infinity;
    const gap = maxVal - minVal;

    for (const ai of sliceHexIndices[maxSlice]) {
      for (const bi of sliceHexIndices[minSlice]) {
        const va = getMetricValue(hexes[ai].tile);
        const vb = getMetricValue(hexes[bi].tile);
        const transfer = va - vb;
        if (transfer > 0 && transfer <= gap) {
          const newGap = Math.abs(maxVal - transfer - (minVal + transfer));
          if (newGap < gap && newGap < bestNewGap) {
            bestA = ai;
            bestB = bi;
            bestNewGap = newGap;
          }
        }
      }
    }

    if (bestA === -1) break;

    // Perform tile swap
    const tempTile = hexes[bestA].tile;
    hexes[bestA].tile = hexes[bestB].tile;
    hexes[bestB].tile = tempTile;
  }

  newMap.sliceStats = computeSliceStats(newMap);
  return newMap;
}
