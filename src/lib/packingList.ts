/**
 * Packing list generator
 * Derives a consolidated packing list from saved outfits
 */

import type { SavedOutfit, ClothingItem } from "@/types";

/** Generate a deduplicated packing list from saved outfits */
export function generatePackingList(savedOutfits: SavedOutfit[]): ClothingItem[] {
  const seen = new Map<string, ClothingItem>();
  for (const saved of savedOutfits) {
    for (const item of saved.outfitSuggestion.items) {
      if (!seen.has(item.id)) {
        seen.set(item.id, item);
      }
    }
  }
  return Array.from(seen.values());
}

/** Group packing list by category for display */
export function groupPackingListByCategory(
  items: ClothingItem[]
): Record<string, ClothingItem[]> {
  const grouped: Record<string, ClothingItem[]> = {};
  const categoryOrder = [
    "tops",
    "bottoms",
    "dresses",
    "outerwear",
    "shoes",
    "accessories",
  ];
  for (const cat of categoryOrder) {
    grouped[cat] = items.filter((i) => i.category === cat);
  }
  return grouped;
}
