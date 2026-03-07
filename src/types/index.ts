/**
 * FitForIt - Core type definitions
 * Centralized types for the outfit planning app.
 */

/** Clothing item categories for the digital closet */
export type ClothingCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "shoes"
  | "outerwear"
  | "accessories";

/** Event/trip types that influence outfit recommendations */
export type EventType =
  | "trip"
  | "wedding"
  | "conference"
  | "party"
  | "vacation"
  | "business"
  | "other";

/** Style/vibe preferences for outfit matching */
export type StyleVibe =
  | "chic"
  | "casual"
  | "beachy"
  | "business casual"
  | "formal"
  | "streetwear"
  | "minimalist"
  | "bohemian";

/** Occasion types for outfit grouping (travel day, brunch, etc.) */
export type OccasionType =
  | "travel_day"
  | "brunch"
  | "dinner"
  | "event"
  | "casual_day"
  | "beach"
  | "exploring"
  | "work";

/** A single clothing item in the user's digital closet */
export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  imageUrl: string;
  notes?: string;
  createdAt: string;
}

/** A trip or event the user is planning for */
export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  eventType: EventType;
  styleVibe: StyleVibe;
  weatherPlaceholder?: string;
  createdAt: string;
}

/** An outfit suggestion combining multiple clothing items */
export interface OutfitSuggestion {
  id: string;
  occasion: OccasionType;
  occasionLabel: string;
  items: ClothingItem[];
  reasoning: string;
  tripId: string;
}

/** A saved outfit card attached to a specific day/occasion in a trip */
export interface SavedOutfit {
  id: string;
  tripId: string;
  outfitSuggestion: OutfitSuggestion;
  dayLabel: string;
  occasionLabel: string;
  savedAt: string;
}
