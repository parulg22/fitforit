/**
 * Generate "Shop Similar" search URLs for clothing items
 */

import type { ClothingItem } from "@/types";

export function getShopSearchUrl(item: ClothingItem): string {
  const query = `${item.color} ${item.name}`.trim();
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
}
