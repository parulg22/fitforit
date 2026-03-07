/**
 * Rule-based outfit recommendation engine
 * Matches closet items to occasions based on event type, vibe, and weather.
 * Designed to be replaced with ML/AI later.
 */

import type {
  ClothingItem,
  ClothingCategory,
  Trip,
  OutfitSuggestion,
  OccasionType,
  EventType,
  StyleVibe,
} from "@/types";

/** Maps occasion types to human-readable labels */
export const OCCASION_LABELS: Record<OccasionType, string> = {
  travel_day: "Travel Day",
  brunch: "Brunch",
  dinner: "Dinner",
  event: "Main Event",
  casual_day: "Casual Day",
  beach: "Beach Day",
  exploring: "Exploring",
  work: "Work / Conference",
};

/** Occasions to suggest based on event type */
const OCCASIONS_BY_EVENT: Record<EventType, OccasionType[]> = {
  trip: ["travel_day", "casual_day", "exploring", "dinner"],
  wedding: ["travel_day", "brunch", "event", "dinner"],
  conference: ["travel_day", "work", "dinner", "casual_day"],
  party: ["casual_day", "event", "dinner"],
  vacation: ["travel_day", "beach", "exploring", "brunch", "dinner"],
  business: ["travel_day", "work", "dinner"],
  other: ["travel_day", "casual_day", "dinner"],
};

/** Category requirements per occasion (what we need for a complete outfit) */
const OCCASION_REQUIREMENTS: Record<
  OccasionType,
  { required: ClothingCategory[]; optional: ClothingCategory[] }
> = {
  travel_day: {
    required: ["tops", "bottoms"],
    optional: ["shoes", "outerwear", "accessories"],
  },
  brunch: {
    required: ["tops", "bottoms"],
    optional: ["dresses", "shoes", "accessories"],
  },
  dinner: {
    required: ["tops", "bottoms"],
    optional: ["dresses", "shoes", "outerwear", "accessories"],
  },
  event: {
    required: ["tops", "bottoms"],
    optional: ["dresses", "shoes", "outerwear", "accessories"],
  },
  casual_day: {
    required: ["tops", "bottoms"],
    optional: ["shoes", "outerwear", "accessories"],
  },
  beach: {
    required: ["tops"],
    optional: ["bottoms", "dresses", "shoes", "accessories"],
  },
  exploring: {
    required: ["tops", "bottoms"],
    optional: ["shoes", "outerwear", "accessories"],
  },
  work: {
    required: ["tops", "bottoms"],
    optional: ["shoes", "outerwear", "accessories"],
  },
};

/** Style-vibe to color preferences (loose matching) */
const VIBE_COLORS: Record<StyleVibe, string[]> = {
  chic: ["black", "white", "navy", "beige", "gray"],
  casual: ["blue", "white", "gray", "black", "beige"],
  beachy: ["white", "coral", "blue", "natural", "sage", "tan"],
  "business casual": ["navy", "white", "beige", "gray", "black"],
  formal: ["black", "navy", "white"],
  streetwear: ["black", "white", "gray", "blue"],
  minimalist: ["black", "white", "gray", "beige"],
  bohemian: ["multi", "sage", "coral", "natural", "tan"],
};

/** Score a clothing item for an occasion (0-100) */
function scoreItemForOccasion(
  item: ClothingItem,
  occasion: OccasionType,
  vibe: StyleVibe,
  eventType: EventType
): number {
  let score = 50; // base score

  const preferredColors = VIBE_COLORS[vibe] || [];
  const itemColorLower = item.color.toLowerCase();
  if (preferredColors.some((c) => itemColorLower.includes(c))) {
    score += 20;
  }

  // Occasion-specific boosts
  switch (occasion) {
    case "travel_day":
    case "exploring":
      if (["tops", "bottoms", "shoes"].includes(item.category)) score += 10;
      if (item.notes?.toLowerCase().includes("comfort")) score += 15;
      break;
    case "beach":
      if (["tops", "dresses", "accessories"].includes(item.category))
        score += 15;
      if (["coral", "white", "blue", "natural"].some((c) => itemColorLower.includes(c)))
        score += 10;
      break;
    case "dinner":
    case "event":
      if (item.category === "dresses") score += 25;
      if (["black", "navy", "white"].some((c) => itemColorLower.includes(c)))
        score += 10;
      break;
    case "work":
      if (["tops", "bottoms", "shoes"].includes(item.category)) score += 10;
      if (item.notes?.toLowerCase().includes("professional")) score += 15;
      break;
    case "brunch":
      if (item.category === "dresses") score += 15;
      if (["white", "coral", "sage", "multi"].some((c) => itemColorLower.includes(c)))
        score += 5;
      break;
    default:
      break;
  }

  return Math.min(100, score);
}

/** Pick best item from a category for an occasion */
function pickBestFromCategory(
  items: ClothingItem[],
  category: ClothingCategory,
  occasion: OccasionType,
  vibe: StyleVibe,
  eventType: EventType,
  excludeIds: Set<string>
): ClothingItem | null {
  const candidates = items.filter(
    (i) => i.category === category && !excludeIds.has(i.id)
  );
  if (candidates.length === 0) return null;

  const scored = candidates.map((item) => ({
    item,
    score: scoreItemForOccasion(item, occasion, vibe, eventType),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0].item;
}

/** Generate reasoning string for an outfit */
function generateReasoning(
  occasion: OccasionType,
  items: ClothingItem[],
  trip: Trip
): string {
  const parts: string[] = [];
  parts.push(`Perfect for ${OCCASION_LABELS[occasion].toLowerCase()}.`);
  parts.push(`Matches your ${trip.styleVibe} vibe.`);
  if (trip.weatherPlaceholder) {
    parts.push(`Suitable for ${trip.weatherPlaceholder}.`);
  }
  const itemNames = items.map((i) => i.name).join(", ");
  parts.push(`Combines ${itemNames} for a cohesive look.`);
  return parts.join(" ");
}

/** Generate outfit suggestions for a trip based on closet items */
export function generateOutfitSuggestions(
  trip: Trip,
  closetItems: ClothingItem[]
): OutfitSuggestion[] {
  const suggestions: OutfitSuggestion[] = [];
  const occasions = OCCASIONS_BY_EVENT[trip.eventType] || [
    "travel_day",
    "casual_day",
    "dinner",
  ];

  for (let i = 0; i < occasions.length; i++) {
    const occasion = occasions[i];
    const req = OCCASION_REQUIREMENTS[occasion];
    const outfitItems: ClothingItem[] = [];
    const usedIds = new Set<string>();

    // Prefer dress for dinner/event/brunch when available
    if (
      ["dinner", "event", "brunch"].includes(occasion) &&
      req.optional.includes("dresses")
    ) {
      const dress = pickBestFromCategory(
        closetItems,
        "dresses",
        occasion,
        trip.styleVibe,
        trip.eventType,
        usedIds
      );
      if (dress) {
        outfitItems.push(dress);
        usedIds.add(dress.id);
      }
    }

    // Fill required categories
    for (const cat of req.required) {
      if (outfitItems.some((i) => i.category === "dresses") && cat !== "tops")
        continue; // dress covers top+bottom for non-beach
      const item = pickBestFromCategory(
        closetItems,
        cat,
        occasion,
        trip.styleVibe,
        trip.eventType,
        usedIds
      );
      if (item) {
        outfitItems.push(item);
        usedIds.add(item.id);
      }
    }

    // Add optional: shoes, outerwear, accessories
    for (const cat of req.optional) {
      if (outfitItems.some((i) => i.category === cat)) continue;
      const item = pickBestFromCategory(
        closetItems,
        cat,
        occasion,
        trip.styleVibe,
        trip.eventType,
        usedIds
      );
      if (item) {
        outfitItems.push(item);
        usedIds.add(item.id);
      }
    }

    if (outfitItems.length >= 1) {
      suggestions.push({
        id: `outfit-${trip.id}-${occasion}-${i}`,
        occasion,
        occasionLabel: OCCASION_LABELS[occasion],
        items: outfitItems,
        reasoning: generateReasoning(occasion, outfitItems, trip),
        tripId: trip.id,
      });
    }
  }

  return suggestions;
}
