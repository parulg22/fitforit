/**
 * Mock trip data - sample trips for demo
 */

import type { Trip } from "@/types";

export const MOCK_TRIPS: Trip[] = [
  {
    id: "trip-1",
    name: "Miami Beach Weekend",
    destination: "Miami, FL",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    eventType: "vacation",
    styleVibe: "beachy",
    weatherPlaceholder: "Warm, 78-82°F",
    createdAt: "2024-03-01T10:00:00Z",
  },
  {
    id: "trip-2",
    name: "Sarah's Wedding",
    destination: "Napa Valley, CA",
    startDate: "2024-04-20",
    endDate: "2024-04-21",
    eventType: "wedding",
    styleVibe: "chic",
    weatherPlaceholder: "Mild, 65-72°F",
    createdAt: "2024-03-10T10:00:00Z",
  },
  {
    id: "trip-3",
    name: "Tech Conference NYC",
    destination: "New York, NY",
    startDate: "2024-05-08",
    endDate: "2024-05-10",
    eventType: "conference",
    styleVibe: "business casual",
    weatherPlaceholder: "Spring, 55-65°F",
    createdAt: "2024-04-01T10:00:00Z",
  },
];
