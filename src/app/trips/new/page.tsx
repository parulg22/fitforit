/**
 * New trip creation flow
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { EventType, StyleVibe } from "@/types";

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "trip", label: "Trip" },
  { value: "vacation", label: "Vacation" },
  { value: "wedding", label: "Wedding" },
  { value: "conference", label: "Conference" },
  { value: "party", label: "Party" },
  { value: "business", label: "Business" },
  { value: "other", label: "Other" },
];

const STYLE_VIBES: { value: StyleVibe; label: string }[] = [
  { value: "chic", label: "Chic" },
  { value: "casual", label: "Casual" },
  { value: "beachy", label: "Beachy" },
  { value: "business casual", label: "Business Casual" },
  { value: "formal", label: "Formal" },
  { value: "streetwear", label: "Streetwear" },
  { value: "minimalist", label: "Minimalist" },
  { value: "bohemian", label: "Bohemian" },
];

export default function NewTripPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventType, setEventType] = useState<EventType>("trip");
  const [styleVibe, setStyleVibe] = useState<StyleVibe>("casual");
  const [weatherPlaceholder, setWeatherPlaceholder] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call - in real app would POST to API
    await new Promise((r) => setTimeout(r, 500));
    const id = `trip-${Date.now()}`;
    // Store in sessionStorage for demo (would use API/DB in production)
    const trip = {
      id,
      name,
      destination,
      startDate,
      endDate,
      eventType,
      styleVibe,
      weatherPlaceholder: weatherPlaceholder || undefined,
      createdAt: new Date().toISOString(),
    };
    const trips = JSON.parse(sessionStorage.getItem("fitforit-trips") || "[]");
    trips.push(trip);
    sessionStorage.setItem("fitforit-trips", JSON.stringify(trips));
    router.push(`/trips/${id}`);
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/trips"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-surface-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Trips
      </Link>

      <h1 className="text-3xl font-bold text-surface-900">Plan a New Trip</h1>
      <p className="mt-2 text-surface-600">
        Tell us about your event and we&apos;ll suggest outfits from your closet
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        <Card className="space-y-6" hover={false}>
          <div>
            <label className="block text-sm font-medium text-surface-700">
              Trip / Event Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Miami Beach Weekend"
              className="mt-1 w-full rounded-lg border border-surface-300 px-4 py-2.5 text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Miami, FL"
              className="mt-1 w-full rounded-lg border border-surface-300 px-4 py-2.5 text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-surface-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-300 px-4 py-2.5 text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-300 px-4 py-2.5 text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700">
              Event Type
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EVENT_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEventType(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    eventType === value
                      ? "bg-brand-600 text-white"
                      : "bg-surface-100 text-surface-700 hover:bg-surface-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700">
              Style / Vibe
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {STYLE_VIBES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStyleVibe(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    styleVibe === value
                      ? "bg-brand-600 text-white"
                      : "bg-surface-100 text-surface-700 hover:bg-surface-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700">
              Weather (placeholder)
            </label>
            <input
              type="text"
              value={weatherPlaceholder}
              onChange={(e) => setWeatherPlaceholder(e.target.value)}
              placeholder="e.g. Warm, 78-82°F"
              className="mt-1 w-full rounded-lg border border-surface-300 px-4 py-2.5 text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </Card>

        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating…" : "Create Trip"}
          </button>
          <Link
            href="/trips"
            className="rounded-xl border border-surface-300 px-8 py-3 font-semibold text-surface-700 transition hover:bg-surface-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
