/**
 * Saved outfits store - persists which outfits user saved to a trip
 * In production, replace with API/DB
 */

import type { SavedOutfit, OutfitSuggestion } from "@/types";

const STORAGE_KEY = "fitforit-saved-outfits";

function getStored(): SavedOutfit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStored(outfits: SavedOutfit[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(outfits));
}

export function getSavedOutfitsForTrip(tripId: string): SavedOutfit[] {
  return getStored().filter((o) => o.tripId === tripId);
}

export function saveOutfit(
  tripId: string,
  suggestion: OutfitSuggestion,
  dayLabel: string,
  occasionLabel: string
): SavedOutfit {
  const saved: SavedOutfit = {
    id: `saved-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    tripId,
    outfitSuggestion: suggestion,
    dayLabel,
    occasionLabel,
    savedAt: new Date().toISOString(),
  };
  const all = getStored();
  all.push(saved);
  setStored(all);
  return saved;
}

export function removeSavedOutfit(id: string): void {
  const all = getStored().filter((o) => o.id !== id);
  setStored(all);
}
