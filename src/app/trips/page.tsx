/**
 * Trips list page - view all trips (mock + user-created) and create new ones
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getAllTrips } from "@/lib/tripStore";
import type { Trip } from "@/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    setTrips(getAllTrips());
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Your Trips</h1>
          <p className="mt-1 text-surface-600">
            Plan outfits for your upcoming events and get packing lists
          </p>
        </div>
        <Link
          href="/trips/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-5 w-5" />
          New Trip
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <Link key={trip.id} href={`/trips/${trip.id}`}>
            <Card className="h-full transition hover:border-brand-200 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900">
                    {trip.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-surface-500">
                    <MapPin className="h-4 w-4" />
                    {trip.destination}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-surface-500">
                    <Calendar className="h-4 w-4" />
                    {trip.startDate} → {trip.endDate}
                  </div>
                </div>
                <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium capitalize text-surface-600">
                  {trip.eventType}
                </span>
              </div>
              <p className="mt-4 text-sm text-surface-600">
                {trip.styleVibe} • {trip.weatherPlaceholder || "No weather"}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
