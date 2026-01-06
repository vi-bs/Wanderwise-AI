import type { GeneratePersonalizedItinerariesInput } from "@/ai/flows/generate-personalized-itineraries";

export type Review = {
  source: string; // e.g., "Google", "TripAdvisor"
  snippet: string;
  rating: number; // e.g., 4.5
};

export type Activity = {
  id: string;
  name: string;
  duration: string; // e.g., "2-3 hours"
  infoLink: string;
  cost: number; // Cost for this activity
  safetyScore: number; // 0-100
  selected: boolean; // To track user selection
  review: Review;
};

export type DailyPlan = {
  day: number;
  title: string;
  activities: Activity[];
};

export type Hotel = {
  id:string;
  name: string;
  rating: number; // e.g., 4.5
  costPerNight: number;
  bookingLink: string;
  safetyScore: number; // 0-100
  review: Review;
};

export type CommuteOption = {
  id: string;
  type: 'Scooter Rental' | 'Car Rental' | 'Airport Taxi' | 'Local Bus' | 'Ride-Sharing';
  cost: number; // Can be per day or per trip
  infoLink: string;
  pros: string[];
  cons: string[];
  safetyScore: number;
};

export type Itinerary = {
  id: string;
  vibe: string;
  title: string;
  description: string;
  dailyPlan: DailyPlan[];
  hotelOptions: Hotel[];
  commuteOptions: CommuteOption[];
  cost: { // This will be calculated based on selections
    total: number;
    flights: number; // Assuming this is fixed for now
    accommodation: number;
    food: number; // Estimate
    activities: number;
    commute: number;
  };
  overallSafetyScore: number; // Average of selected items
};

export type TripData = {
  input: GeneratePersonalizedItinerariesInput;
  itineraries: Itinerary[];
};
