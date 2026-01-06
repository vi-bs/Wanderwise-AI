import type { GeneratePersonalizedItinerariesInput } from "@/ai/flows/generate-personalized-itineraries";

export type DailyPlan = {
  day: number;
  title: string;
  activities: string[];
};

export type ItineraryCost = {
  total: string;
  flights: string;
  accommodation: string;
  food: string;
  activities: string;
};

export type Itinerary = {
  id: string;
  vibe: string;
  title: string;
  description: string;
  dailyPlan: DailyPlan[];
  cost: ItineraryCost;
};

export type TripData = {
  input: GeneratePersonalizedItinerariesInput;
  itineraries: Itinerary[];
  selectedItinerary: Itinerary | null;
  // selectedFlight, selectedStay, etc. would go here after customization
};
