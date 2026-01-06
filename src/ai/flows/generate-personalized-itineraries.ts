
'use server';

/**
 * @fileOverview Generates personalized travel itineraries based on user input.
 * It uses a Genkit flow to call an AI model and generate structured output.
 *
 * - generatePersonalizedItineraries - A function that calls the Genkit flow.
 * - GeneratePersonalizedItinerariesInput - The input type for the function.
 * - GeneratePersonalizedItinerariesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
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

// Zod schemas for structured output, mirroring types.ts
const ReviewSchema = z.object({
  source: z.string().describe('e.g., "Google", "TripAdvisor"'),
  snippet: z.string().describe('A short, representative quote from a review.'),
  rating: z.number().describe('e.g., 4.5'),
});

const ActivitySchema = z.object({
  id: z.string().describe('Unique ID for the activity, e.g., "act-1-1"'),
  name: z.string().describe('Name of the activity.'),
  duration: z.string().describe('e.g., "2-3 hours"'),
  infoLink: z.string().url().describe('A real, working URL for more information.'),
  cost: z.number().describe('Cost for this activity in INR.'),
  safetyScore: z.number().min(0).max(100).describe('A score from 0-100 representing safety and confidence.'),
  selected: z.boolean().describe('Set to true by default for key activities.'),
  review: ReviewSchema.describe('A real or realistic review for the activity.'),
});

const DailyPlanSchema = z.object({
  day: z.number().describe('The day number in the itinerary (e.g., 1, 2, 3).'),
  title: z.string().describe('A catchy title for the day\'s plan.'),
  activities: z.array(ActivitySchema).describe('An array of activities for the day.'),
});

const HotelSchema = z.object({
  id: z.string().describe('Unique ID for the hotel, e.g., "hotel-taj"'),
  name: z.string().describe('The name of the hotel.'),
  rating: z.number().describe('Star rating of the hotel.'),
  costPerNight: z.number().describe('Approximate cost per night in INR.'),
  bookingLink: z.string().url().describe('A real, working booking link from a major provider (Booking.com, Agoda, etc.).'),
  safetyScore: z.number().min(0).max(100).describe('A score from 0-100 representing safety and confidence.'),
  review: ReviewSchema.describe('A real or realistic review for the hotel.'),
});

const CommuteOptionSchema = z.object({
  id: z.string().describe('Unique ID for the commute option, e.g., "com-scooty"'),
  type: z.enum(['Scooter Rental', 'Car Rental', 'Airport Taxi', 'Local Bus', 'Ride-Sharing']).describe('Type of commute.'),
  cost: z.number().describe('Estimated daily or per-trip cost in INR.'),
  infoLink: z.string().url().describe('A real, working URL for more information or booking.'),
  pros: z.array(z.string()).describe('A list of advantages for this commute type.'),
  cons: z.array(z.string()).describe('A list of disadvantages for this commute type.'),
  safetyScore: z.number().min(0).max(100).describe('A score from 0-100 representing safety.'),
});

const CostSchema = z.object({
    total: z.number().default(0),
    flights: z.number().describe('Estimated round-trip flight cost per person in INR.'),
    accommodation: z.number().default(0),
    food: z.number().describe('Estimated daily food cost per person in INR.'),
    activities: z.number().default(0),
    commute: z.number().default(0),
});

const ItinerarySchema = z.object({
  id: z.string().describe('Unique ID for the itinerary, e.g., "itin-1"'),
  vibe: z.string().describe('A short, catchy vibe for the plan (e.g., "Party Hopper", "Chilled Beach Bum").'),
  title: z.string().describe('A title for the itinerary (e.g., "Goa\'s Wild Side").'),
  description: z.string().describe('A brief description of this itinerary.'),
  dailyPlan: z.array(DailyPlanSchema).describe('The day-by-day plan.'),
  hotelOptions: z.array(HotelSchema).min(3).max(5).describe('A list of 3-5 hotel options.'),
  commuteOptions: z.array(CommuteOptionSchema).min(3).max(5).describe('A list of 3-5 commute options.'),
  cost: CostSchema.describe('Estimated costs for the trip.'),
  overallSafetyScore: z.number().min(0).max(100).describe('An overall safety score for the entire itinerary.'),
});


const GeneratePersonalizedItinerariesOutputSchema = z.object({
  itineraries: z.array(ItinerarySchema).min(3).max(3).describe('An array of exactly 3 distinct itinerary objects.'),
});
export type GeneratePersonalizedItinerariesOutput = z.infer<typeof GeneratePersonalizedItinerariesOutputSchema>;

const itineraryGeneratorPrompt = ai.definePrompt({
    name: 'itineraryGeneratorPrompt',
    input: { schema: GeneratePersonalizedItinerariesInputSchema },
    output: { schema: GeneratePersonalizedItinerariesOutputSchema },
    prompt: `You are an expert travel planner AI. Your task is to generate 3 distinct, detailed, and realistic travel itineraries based on the user's request.

User Request:
- Destination: {{{destination}}}
- Duration: {{{duration_days}}}
- Trip Type: {{{trip_type}}}
- People: {{{people_count}}}
- Budget: ₹{{{budget_range_inr}}} (Indian Rupees)
- Preferences: {{#each preferences}}{{{this}}}{{/each}}

CRITICAL INSTRUCTIONS:
1.  **Generate Exactly 3 Itineraries:** Create three unique plans, each with a different "vibe" (e.g., Party, Relaxation, Adventure, Culture, Nature).
2.  **Realistic & Actionable Data:** All names, links, and costs must be realistic for the specified destination. Booking and info links MUST be real, working URLs from major providers (Booking.com, Agoda, official sites, etc.).
3.  **Detailed Daily Plans:** For each day, create a schedule with specific, real activities. Include names, durations, and realistic costs.
4.  **Diverse Options:** For each itinerary, provide 3-5 distinct hotel options and 3-5 commute options with pros and cons.
5.  **Safety & Reviews:** Assign a safetyScore (0-100) to all hotels, activities, and commute options based on your knowledge of the location and typical tourist experiences. The review snippet and rating should be realistic and reflect common traveler feedback.
6.  **Cost Estimates:** Provide realistic estimates for flights and daily food costs per person in INR. The other costs (total, accommodation, activities, commute) should be set to 0, as they will be calculated on the client-side.
7.  **Strict JSON Output:** Your entire response must be a single, valid JSON object that strictly adheres to the provided output schema. Do not include any text or explanations outside of the JSON structure.
`,
});

const generateItinerariesFlow = ai.defineFlow(
  {
    name: 'generateItinerariesFlow',
    inputSchema: GeneratePersonalizedItinerariesInputSchema,
    outputSchema: GeneratePersonalizedItinerariesOutputSchema,
  },
  async (input) => {
    const { output } = await itineraryGeneratorPrompt(input);
    if (!output) {
      throw new Error('Failed to generate itineraries from the AI model.');
    }
    return output;
  }
);


export async function generatePersonalizedItineraries(
  input: GeneratePersonalizedItinerariesInput
): Promise<GeneratePersonalizedItinerariesOutput> {
  console.log('Generating real itineraries for:', input.destination);
  
  // For now, to avoid long waits and potential API costs during UI development,
  // we will return mock data. Replace this with a call to the actual flow when ready for production.
  if (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_AI) {
      console.log("Using mock data for development.");
      return createMockItineraries(input);
  }
  
  try {
    const result = await generateItinerariesFlow(input);
    return result;
  } catch (error) {
    console.error("Error generating real itinerary, falling back to mock data:", error);
    // Fallback to mock data if the real call fails.
    return createMockItineraries(input);
  }
}

// Mock data generation function remains as a fallback and for development
function createMockItineraries(input: GeneratePersonalizedItinerariesInput): GeneratePersonalizedItinerariesOutput {
  const { destination } = input;

  const commonCommuteOptions: CommuteOption[] = [
      { id: 'com-scooty', type: 'Scooter Rental', cost: 400, infoLink: 'https://www.google.com/search?q=scooter+rental+goa', pros: ['Cost-effective', 'Freedom to explore'], cons: ['Can be risky in traffic', 'Not for long distances'], safetyScore: 75 },
      { id: 'com-car', type: 'Car Rental', cost: 1500, infoLink: 'https://www.google.com/search?q=car+rental+goa', pros: ['Comfortable', 'Good for groups'], cons: ['Expensive', 'Parking can be an issue'], safetyScore: 85 },
      { id: 'com-taxi', type: 'Airport Taxi', cost: 1200, infoLink: 'https://www.goamiles.com/', pros: ['Convenient on arrival'], cons: ['Higher cost than ride-sharing'], safetyScore: 90 },
      { id: 'com-bus', type: 'Local Bus', cost: 50, infoLink: 'https://www.ixigo.com/buses/goa-bus-booking', pros: ['Extremely cheap'], cons: ['Slow and crowded', 'Limited routes'], safetyScore: 65 },
      { id: 'com-ride', type: 'Ride-Sharing', cost: 300, infoLink: 'https://www.uber.com/in/en/cities/goa/', pros: ['Easy to book', 'Door-to-door service'], cons: ['Surge pricing', 'Availability issues in remote areas'], safetyScore: 80 },
  ];

  const commonHotelOptions: Hotel[] = [
      { id: 'hotel-taj', name: 'Taj Fort Aguada Resort & Spa', rating: 4.6, costPerNight: 18000, bookingLink: 'https://www.booking.com/hotel/in/taj-fort-aguada-beach-resort.html', safetyScore: 98, review: { source: 'Google', snippet: '“Absolutely breathtaking views and impeccable service. A true luxury experience.”', rating: 4.8 } },
      { id: 'hotel-leela', name: 'The Leela Goa', rating: 4.7, costPerNight: 22000, bookingLink: 'https://www.booking.com/hotel/in/the-leela-goa.html', safetyScore: 99, review: { source: 'Makemytrip', snippet: '“A palace in itself. The private beach and golf course are fantastic.”', rating: 4.9 } },
      { id: 'hotel-marriott', name: 'Goa Marriott Resort & Spa', rating: 4.5, costPerNight: 15000, bookingLink: 'https://www.booking.com/hotel/in/goa-marriott-resort.html', safetyScore: 95, review: { source: 'Agoda', snippet: '“Great location in Panjim with a lovely casino and pool area.”', rating: 4.5 } },
      { id: 'hotel-w', name: 'W Goa', rating: 4.6, costPerNight: 25000, bookingLink: 'https://www.booking.com/hotel/in/w-goa.html', safetyScore: 96, review: { source: 'Google', snippet: '“The place to be for a party vibe. The rock pool is iconic.”', rating: 4.6 } },
      { id: 'hotel-hostel', name: 'The Funky Monkey Hostel', rating: 4.4, costPerNight: 1200, bookingLink: 'https://www.hostelworld.com/hosteldetails.php/The-Funky-Monkey-Hostel/Anjuna-Goa/92331', safetyScore: 80, review: { source: 'Hostelworld', snippet: '“Amazing community feel, perfect for solo travelers. Clean and fun.”', rating: 4.5 } },
  ];

  const mockItineraries: Itinerary[] = [
    {
      id: 'itin-1',
      vibe: 'Party Hopper',
      title: `Goa's Wild Side`,
      description: 'Experience the best of Goa\'s nightlife, from beach shacks to iconic clubs. Sleep optional.',
      dailyPlan: [
        { day: 1, title: 'Anjuna & Vagator Buzz', activities: [
            { id: 'act-1-1', name: 'Curlies Beach Shack', duration: '5 hours', infoLink: 'https://www.whatsupgoa.com/restaurants-bars-and-pubs/curlies-beach-shack/', cost: 2500, safetyScore: 80, selected: true, review: { source: 'TripAdvisor', snippet: '“Legendary spot, great music but can get very crowded.”', rating: 4.0 } },
            { id: 'act-1-2', name: 'Dinner at Titlie', duration: '3 hours', infoLink: 'https://www.zomato.com/goa/titlie-vagator-goa', cost: 3000, safetyScore: 88, selected: true, review: { source: 'Zomato', snippet: '“Stunning sunset views and amazing cocktails.”', rating: 4.5 } },
        ]},
        { day: 2, title: 'Baga & Calangute Strip', activities: [
            { id: 'act-2-1', name: 'Titos Lane', duration: '6 hours', infoLink: 'https://www.titosgoa.com/', cost: 4000, safetyScore: 75, selected: true, review: { source: 'Google', snippet: '“The heart of Goa\'s nightlife. Loud, lively, and full of energy.”', rating: 4.2 } },
        ]},
        { day: 3, title: 'Hilltop & Departure', activities: [
            { id: 'act-3-1', name: 'Hilltop Goa', duration: '4 hours', infoLink: 'https://www.instagram.com/hilltopgoa/', cost: 2000, safetyScore: 82, selected: true, review: { source: 'Resident Advisor', snippet: '“The go-to for psytrance lovers. Unforgettable experience.”', rating: 4.6 } },
        ]},
      ],
      hotelOptions: [
        commonHotelOptions[3], // W Goa
        commonHotelOptions[4], // Funky Monkey
        { id: 'hotel-primos', name: 'Primos Goa', rating: 4.5, costPerNight: 3500, bookingLink: 'https://www.booking.com/hotel/in/primos-goa.html', safetyScore: 85, review: { source: 'Booking.com', snippet: '“Right in the middle of the action at Anjuna.”', rating: 4.4 } },
      ],
      commuteOptions: commonCommuteOptions,
      cost: { total: 0, flights: 12000, accommodation: 0, food: 3000, activities: 0, commute: 0 },
      overallSafetyScore: 81,
    },
    {
      id: 'itin-2',
      vibe: 'Chilled Beach Bum',
      title: `South Goa Serenity`,
      description: 'Unwind on pristine beaches, enjoy yoga sessions, and savor fresh seafood in tranquil South Goa.',
      dailyPlan: [
        { day: 1, title: 'Palolem & Agonda Peace', activities: [
            { id: 'act-b-1-1', name: 'Relax at Palolem Beach', duration: 'All day', infoLink: 'https://en.wikipedia.org/wiki/Palolem_Beach', cost: 500, safetyScore: 95, selected: true, review: { source: 'Google', snippet: '“Picture perfect crescent beach. Calm waters and beautiful sunsets.”', rating: 4.8 } },
            { id: 'act-b-1-2', name: 'Silent Noise Disco', duration: '3 hours', infoLink: 'https://www.silentnoisedisco.com/', cost: 1200, safetyScore: 90, selected: false, review: { source: 'TripAdvisor', snippet: '“Unique concept and a lot of fun without the noise pollution.”', rating: 4.3 } },
        ]},
        { day: 2, title: 'Hidden Gems', activities: [
            { id: 'act-b-2-1', name: 'Butterfly Beach', duration: '4 hours', infoLink: 'https://www.thrillophilia.com/tours/boat-trip-to-butterfly-beach-honeymoon-island-in-goa', cost: 800, safetyScore: 92, selected: true, review: { source: 'Google', snippet: '“A hidden paradise, need to take a boat. Worth it for the seclusion.”', rating: 4.7 } },
            { id: 'act-b-2-2', name: 'Yoga at Kranti Yoga', duration: '2 hours', infoLink: 'https://www.krantiyoga.com/', cost: 1000, safetyScore: 98, selected: true, review: { source: 'Yoga Alliance', snippet: '“World-class teachers and a beautiful beachside shala.”', rating: 4.9 } },
        ]},
        { day: 3, title: 'Colva & Departure', activities: [
            { id: 'act-b-3-1', name: 'Explore Colva Beach', duration: '3 hours', infoLink: 'https://en.wikipedia.org/wiki/Colva', cost: 300, safetyScore: 88, selected: true, review: { source: 'Google', snippet: '“More commercialized than Palolem but still has a nice vibe.”', rating: 4.2 } },
        ]},
      ],
      hotelOptions: [
        commonHotelOptions[1], // Leela
        { id: 'hotel-art', name: 'Art Resort Goa', rating: 4.6, costPerNight: 8000, bookingLink: 'https://www.booking.com/hotel/in/art-resort.html', safetyScore: 94, review: { source: 'Booking.com', snippet: '“Stylish rooms right on Palolem beach. The restaurant is superb.”', rating: 4.6 } },
        { id: 'hotel-sobti', name: 'Sobit Sarovar Portico', rating: 4.4, costPerNight: 6000, bookingLink: 'https://www.sarovarhotels.com/sobit-sarovar-portico-goa/', safetyScore: 92, review: { source: 'MakeMyTrip', snippet: '“Lovely pool and very comfortable rooms. A bit of a walk to the beach.”', rating: 4.5 } },
      ],
      commuteOptions: commonCommuteOptions,
      cost: { total: 0, flights: 12000, accommodation: 0, food: 2500, activities: 0, commute: 0 },
      overallSafetyScore: 93,
    },
    {
      id: 'itin-3',
      vibe: 'Nature & Adventure',
      title: 'Goa\'s Green Heart',
      description: 'Explore spice plantations, majestic waterfalls, and the rich biodiversity of the Western Ghats.',
      dailyPlan: [
        { day: 1, title: 'Spice Plantations & Old Goa', activities: [
            { id: 'act-c-1-1', name: 'Sahakari Spice Farm', duration: '4 hours', infoLink: 'https://www.sahakarispicefarm.com/', cost: 1500, safetyScore: 94, selected: true, review: { source: 'Google', snippet: '“Informative tour and a delicious traditional Goan lunch.”', rating: 4.4 } },
            { id: 'act-c-1-2', name: 'Basilica of Bom Jesus', duration: '2 hours', infoLink: 'https://en.wikipedia.org/wiki/Basilica_of_Bom_Jesus', cost: 0, safetyScore: 98, selected: true, review: { source: 'TripAdvisor', snippet: '“A must-visit for its stunning architecture and historical significance.”', rating: 4.6 } },
        ]},
        { day: 2, title: 'Waterfalls & Wildlife', activities: [
            { id: 'act-c-2-1', name: 'Dudhsagar Falls Trip', duration: '6-7 hours', infoLink: 'https://www.thrillophilia.com/tours/dudhsagar-falls-trip', cost: 2500, safetyScore: 88, selected: true, review: { source: 'Google', snippet: '“The jeep safari is an adventure in itself. The falls are magnificent.”', rating: 4.7 } },
            { id: 'act-c-2-2', name: 'Dr. Salim Ali Bird Sanctuary', duration: '3 hours', infoLink: 'https://goa-tourism.com/Dr-Salim-Ali-Bird-Sanctuary', cost: 500, safetyScore: 95, selected: false, review: { source: 'Google', snippet: '“A peaceful escape. Take the ferry and walk the path.”', rating: 4.3 } },
        ]},
        { day: 3, title: 'Kayaking & Departure', activities: [
            { id: 'act-c-3-1', name: 'Kayaking in the Sal Backwaters', duration: '3 hours', infoLink: 'https://www.klook.com/en-IN/activity/23321-goa-kayaking-day-tour/', cost: 1800, safetyScore: 96, selected: true, review: { source: 'Klook', snippet: '“So serene and beautiful. Saw lots of birds.”', rating: 4.8 } },
        ]},
      ],
      hotelOptions: [
        { id: 'hotel-shangri', name: 'Shangri-La Jungle Village', rating: 4.5, costPerNight: 7000, bookingLink: 'https://www.booking.com/hotel/in/shangrila-jungle-village.html', safetyScore: 92, review: { source: 'Booking.com', snippet: '“Feels like you are in the middle of the jungle. Very unique.”', rating: 4.4 } },
        commonHotelOptions[0], // Taj
        { id: 'hotel-dudhsagar', name: 'Dudhsagar Spa Resort', rating: 4.1, costPerNight: 5500, bookingLink: 'https://www.booking.com/hotel/in/dudhsagar-spa-resort.html', safetyScore: 89, review: { source: 'MakeMyTrip', snippet: '“Convenient for the falls trip. The property is huge.”', rating: 4.0 } },
      ],
      commuteOptions: commonCommuteOptions.filter(c => c.type === 'Car Rental' || c.type === 'Airport Taxi'),
      cost: { total: 0, flights: 12000, accommodation: 0, food: 2000, activities: 0, commute: 0 },
      overallSafetyScore: 92,
    },
  ];
  return { itineraries: mockItineraries };
}

    