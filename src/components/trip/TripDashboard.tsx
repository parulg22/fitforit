/**
 * Trip dashboard - itinerary, outfit suggestions, packing list
 * Main hub for trip planning
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Calendar, Bookmark, Package, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getTripById } from "@/lib/tripStore";
import {
  getSavedOutfitsForTrip,
  saveOutfit,
  removeSavedOutfit,
} from "@/lib/savedOutfitsStore";
import { generateOutfitSuggestions } from "@/lib/outfitEngine";
import { generatePackingList, groupPackingListByCategory } from "@/lib/packingList";
import { getClosetItems } from "@/lib/closetStore";
import type { Trip, OutfitSuggestion, SavedOutfit } from "@/types";
import { TryOnModal } from "@/components/tryon/TryOnModal";
import type { ClothingItem } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  tops: "Tops",
  bottoms: "Bottoms",
  dresses: "Dresses",
  shoes: "Shoes",
  outerwear: "Outerwear",
  accessories: "Accessories",
};

export function TripDashboard({ tripId }: { tripId: string }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [tryOnItem, setTryOnItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getTripById(tripId);
    setTrip(t || null);
    if (t) {
      const closetItems = getClosetItems();
      setSuggestions(generateOutfitSuggestions(t, closetItems));
      setSavedOutfits(getSavedOutfitsForTrip(tripId));
    }
    setLoading(false);
  }, [tripId]);

  const handleSaveOutfit = (suggestion: OutfitSuggestion) => {
    const saved = saveOutfit(
      tripId,
      suggestion,
      suggestion.occasionLabel,
      suggestion.occasionLabel
    );
    setSavedOutfits((prev) => [...prev, saved]);
  };

  const handleRemoveOutfit = (savedId: string) => {
    removeSavedOutfit(savedId);
    setSavedOutfits((prev) => prev.filter((o) => o.id !== savedId));
  };

  const packingList = generatePackingList(savedOutfits);
  const groupedPacking = groupPackingListByCategory(packingList);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-surface-900">Trip not found</h2>
        <p className="mt-2 text-surface-600">
          This trip may have been deleted or the link is invalid.
        </p>
        <Link
          href="/trips"
          className="mt-6 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trips
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/trips"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-surface-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Trips
      </Link>

      {/* Trip header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-surface-900">{trip.name}</h1>
        <div className="mt-4 flex flex-wrap gap-6 text-surface-600">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {trip.destination}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {trip.startDate} → {trip.endDate}
          </span>
          <span className="rounded-full bg-surface-100 px-3 py-1 text-sm capitalize">
            {trip.eventType}
          </span>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 capitalize">
            {trip.styleVibe}
          </span>
        </div>
        {trip.weatherPlaceholder && (
          <p className="mt-2 text-sm text-surface-500">
            Weather: {trip.weatherPlaceholder}
          </p>
        )}
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Main content - suggestions */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-surface-900">
              <Sparkles className="h-5 w-5 text-brand-500" />
              Outfit Suggestions
            </h2>
            <p className="mb-6 text-surface-600">
              Based on your {trip.styleVibe} vibe and {trip.eventType} event type
            </p>
            <div className="space-y-6">
              {suggestions.map((suggestion) => (
                <OutfitSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onSave={() => handleSaveOutfit(suggestion)}
                  onTryOn={(item) => setTryOnItem(item)}
                  isSaved={savedOutfits.some(
                    (s) => s.outfitSuggestion.id === suggestion.id
                  )}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar - saved outfits + packing list */}
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-surface-900">
              <Bookmark className="h-5 w-5 text-brand-500" />
              Saved Outfits ({savedOutfits.length})
            </h2>
            {savedOutfits.length === 0 ? (
              <Card hover={false} className="py-8 text-center">
                <p className="text-surface-600">
                  Click &quot;Save to Trip&quot; on outfit suggestions below to add them here and build your packing list
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {savedOutfits.map((saved) => (
                  <SavedOutfitCard
                    key={saved.id}
                    saved={saved}
                    onRemove={() => handleRemoveOutfit(saved.id)}
                    onTryOn={(item) => setTryOnItem(item)}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-surface-900">
              <Package className="h-5 w-5 text-brand-500" />
              Packing List
            </h2>
            {packingList.length === 0 ? (
              <Card hover={false} className="py-8 text-center">
                <p className="text-surface-600">
                  Save outfits to generate your packing list
                </p>
              </Card>
            ) : (
              <Card hover={false} className="p-4">
                <ul className="space-y-3">
                  {Object.entries(groupedPacking).map(
                    ([cat, items]) =>
                      items.length > 0 && (
                        <li key={cat}>
                          <span className="text-sm font-medium text-surface-700">
                            {CATEGORY_LABELS[cat]}
                          </span>
                          <ul className="mt-1 space-y-1 pl-2">
                            {items.map((item) => (
                              <li
                                key={item.id}
                                className="text-sm text-surface-600"
                              >
                                • {item.name}
                              </li>
                            ))}
                          </ul>
                        </li>
                      )
                  )}
                </ul>
              </Card>
            )}
          </section>
        </div>
      </div>

      <TryOnModal
        item={tryOnItem}
        open={!!tryOnItem}
        onClose={() => setTryOnItem(null)}
      />
    </div>
  );
}

function OutfitSuggestionCard({
  suggestion,
  onSave,
  onTryOn,
  isSaved,
}: {
  suggestion: OutfitSuggestion;
  onSave: () => void;
  onTryOn: (item: ClothingItem) => void;
  isSaved: boolean;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-surface-900">
          {suggestion.occasionLabel}
        </h3>
        {!isSaved && (
          <button
            onClick={onSave}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Save to Trip
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-surface-600">{suggestion.reasoning}</p>
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-surface-500">
          Click any item to try it on
        </p>
        <div className="flex flex-wrap gap-4">
          {suggestion.items.map((item) => (
            <button
              key={item.id}
              onClick={() => onTryOn(item)}
              className="group flex flex-col items-center gap-2"
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-surface-100 ring-1 ring-surface-200 transition group-hover:scale-105 group-hover:ring-brand-500">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <span className="max-w-[96px] truncate text-center text-xs text-surface-600 group-hover:text-surface-900">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

function SavedOutfitCard({
  saved,
  onRemove,
  onTryOn,
}: {
  saved: SavedOutfit;
  onRemove: () => void;
  onTryOn: (item: ClothingItem) => void;
}) {
  const { outfitSuggestion } = saved;
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between border-b border-surface-100 pb-3">
        <h3 className="font-semibold text-surface-900">
          {saved.occasionLabel}
        </h3>
        <button
          onClick={onRemove}
          className="text-sm text-surface-500 hover:text-red-600"
        >
          Remove
        </button>
      </div>
      {/* Full outfit preview - larger images so you can see each piece */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {outfitSuggestion.items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTryOn(item)}
            className="group flex flex-col items-center gap-2"
          >
            <div className="relative aspect-square w-full min-w-0 overflow-hidden rounded-lg bg-surface-100 ring-1 ring-surface-200 transition group-hover:ring-2 group-hover:ring-brand-500">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover transition group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 120px"
              />
            </div>
            <span className="max-w-full truncate text-center text-xs font-medium text-surface-700 group-hover:text-brand-600">
              {item.name}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-surface-500">
        Click any item to try it on
      </p>
    </Card>
  );
}
