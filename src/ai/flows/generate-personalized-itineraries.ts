'use server';

/**
 * @fileOverview Generates personalized travel itineraries based on user input.
 * For now, it returns mock data to simulate the output of a complex AI workflow.
 *
 * - generatePersonalizedItineraries - A function that returns mock generated itineraries.
 * - GeneratePersonalizedItinerariesInput - The input type for the function.
 * - GeneratePersonalizedItinerariesOutput - The return type for the function.
 */

import { z } from 'genkit';
import type { Itinerary } from '@/lib/types';

const GeneratePersonalizedItinerariesInputSchema = z.object({
  destination: z.string().describe('The travel destination.'),
  duration_days: z.string().describe('The duration of the trip in days.'),
  trip_type: z.enum(['formal', 'informal']).describe('The type of trip (formal or informal).'),
  budget_range_inr: z.string().describe('The budget range for the trip in INR.'),
  round_trip: z.boolean().describe('Whether the trip is round trip or one way.'),
  people_count: z.string().describe('The number of people traveling.'),
  preferences: z.array(z.string()).describe('An array of travel preferences.'),
  travel_dates: z.string().describe('The desired travel dates.'),
});
export type GeneratePersonalizedItinerariesInput = z.infer<typeof GeneratePersonalizedItinerariesInputSchema>;

// The output will be an array of full Itinerary objects
const GeneratePersonalizedItinerariesOutputSchema = z.object({
  itineraries: z.array(z.any()),
});
export type GeneratePersonalizedItinerariesOutput = z.infer<typeof GeneratePersonalizedItinerariesOutputSchema>;

// Mock data generation function
function createMockItineraries(input: GeneratePersonalizedItinerariesInput): Itinerary[] {
  const { destination } = input;

  const mockItineraries: Itinerary[] = [
    {
      id: 'itin-1',
      vibe: 'Relaxed Explorer',
      title: `A Chill Week in ${destination}`,
      description: 'Take it easy and soak in the culture, food, and sights without a tight schedule. Perfect for those who want to wander and discover.',
      dailyPlan: [
        {
          day: 1,
          title: 'Arrival & Local Flavors',
          activities: [
            { id: 'act-1-1', name: `Explore the old town`, duration: '3-4 hours', infoLink: '#', cost: 0, safetyScore: 95, selected: true },
            { id: 'act-1-2', name: `Dinner at a traditional restaurant`, duration: '2 hours', infoLink: '#', cost: 2500, safetyScore: 98, selected: true },
          ],
        },
        {
          day: 2,
          title: 'Museums & Markets',
          activities: [
            { id: 'act-2-1', name: `Visit the National Museum`, duration: '2-3 hours', infoLink: '#', cost: 1000, safetyScore: 92, selected: true },
            { id: 'act-2-2', name: `Shopping at the central market`, duration: '3 hours', infoLink: '#', cost: 5000, safetyScore: 88, selected: false },
            { id: 'act-2-3', name: 'Evening street food tour', duration: '2 hours', infoLink: '#', cost: 1500, safetyScore: 90, selected: true },
          ],
        },
      ],
      hotelOptions: [
        { id: 'hotel-1', name: 'The Grand Heritage', rating: 4.5, costPerNight: 8000, bookingLink: '#', safetyScore: 95 },
        { id: 'hotel-2', name: 'City Comfort Inn', rating: 3.8, costPerNight: 4500, bookingLink: '#', safetyScore: 91 },
        { id: 'hotel-3', name: 'Budget Stay Plus', rating: 3.2, costPerNight: 2500, bookingLink: '#', safetyScore: 85 },
      ],
      commuteOptions: [
        { id: 'com-1', type: 'Metro', cost: 500, infoLink: '#' },
        { id: 'com-2', type: 'Taxi', cost: 2000, infoLink: '#' },
        { id: 'com-3', type: 'Rental Car', cost: 3500, infoLink: '#' },
      ],
      cost: { total: 0, flights: 15000, accommodation: 0, food: 8000, activities: 0, commute: 0 },
      overallSafetyScore: 92,
    },
    // You can add more mock itineraries here for different "vibes"
  ];
  return mockItineraries;
}


export async function generatePersonalizedItineraries(
  input: GeneratePersonalizedItinerariesInput
): Promise<GeneratePersonalizedItinerariesOutput> {
  // We are bypassing the webhook and returning mock data directly
  console.log('Generating mock itineraries for:', input.destination);
  const itineraries = createMockItineraries(input);
  return Promise.resolve({ itineraries });
}
