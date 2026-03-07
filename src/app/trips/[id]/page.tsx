/**
 * Trip detail page - dashboard with outfit suggestions, itinerary, packing list
 */
import { TripDashboard } from "@/components/trip/TripDashboard";

export default function TripDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <TripDashboard tripId={params.id} />;
}
