/**
 * Trip store - combines mock data with sessionStorage for demo
 * In production, replace with API/DB calls
 */

import type { Trip } from "@/types";
import { MOCK_TRIPS } from "@/data/mockTrips";

const STORAGE_KEY = "fitforit-trips";

function getStoredTrips(): Trip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Get all trips (mock + user-created) */
export function getAllTrips(): Trip[] {
  const stored = getStoredTrips();
  const mockIds = new Set(MOCK_TRIPS.map((t) => t.id));
  const userTrips = stored.filter((t) => !mockIds.has(t.id));
  return [...MOCK_TRIPS, ...userTrips];
}

/** Get a single trip by ID */
export function getTripById(id: string): Trip | undefined {
  const all = getAllTrips();
  return all.find((t) => t.id === id);
}
