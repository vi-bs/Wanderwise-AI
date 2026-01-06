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
  const days = 3; 

  const commonCommuteOptions = [
      { id: 'com-scooty', type: 'Scooter Rental', cost: 400, infoLink: 'https://www.google.com/search?q=scooter+rental+goa', pros: ['Cost-effective', 'Freedom to explore'], cons: ['Can be risky in traffic', 'Not for long distances'], safetyScore: 75 },
      { id: 'com-car', type: 'Car Rental', cost: 1500, infoLink: 'https://www.google.com/search?q=car+rental+goa', pros: ['Comfortable', 'Good for groups'], cons: ['Expensive', 'Parking can be an issue'], safetyScore: 85 },
      { id: 'com-taxi', type: 'Airport Taxi', cost: 1200, infoLink: 'https://www.goamiles.com/', pros: ['Convenient on arrival'], cons: ['Higher cost than ride-sharing'], safetyScore: 90 },
      { id: 'com-bus', type: 'Local Bus', cost: 50, infoLink: '#', pros: ['Extremely cheap'], cons: ['Slow and crowded', 'Limited routes'], safetyScore: 65 },
      { id: 'com-ride', type: 'Ride-Sharing', cost: 300, infoLink: 'https://www.uber.com/in/en/cities/goa/', pros: ['Easy to book', 'Door-to-door service'], cons: ['Surge pricing', 'Availability issues in remote areas'], safetyScore: 80 },
  ];

  const commonHotelOptions = [
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
            { id: 'act-1-1', name: 'Curlies Beach Shack', duration: '5 hours', infoLink: '#', cost: 2500, safetyScore: 80, selected: true, review: { source: 'TripAdvisor', snippet: '“Legendary spot, great music but can get very crowded.”', rating: 4.0 } },
            { id: 'act-1-2', name: 'Dinner at Titlie', duration: '3 hours', infoLink: '#', cost: 3000, safetyScore: 88, selected: true, review: { source: 'Zomato', snippet: '“Stunning sunset views and amazing cocktails.”', rating: 4.5 } },
        ]},
        { day: 2, title: 'Baga & Calangute Strip', activities: [
            { id: 'act-2-1', name: 'Titos Lane', duration: '6 hours', infoLink: '#', cost: 4000, safetyScore: 75, selected: true, review: { source: 'Google', snippet: '“The heart of Goa\'s nightlife. Loud, lively, and full of energy.”', rating: 4.2 } },
        ]},
        { day: 3, title: 'Hilltop & Departure', activities: [
            { id: 'act-3-1', name: 'Hilltop Goa', duration: '4 hours', infoLink: '#', cost: 2000, safetyScore: 82, selected: true, review: { source: 'Resident Advisor', snippet: '“The go-to for psytrance lovers. Unforgettable experience.”', rating: 4.6 } },
        ]},
      ],
      hotelOptions: [
        commonHotelOptions[3], // W Goa
        commonHotelOptions[4], // Funky Monkey
        { id: 'hotel-primos', name: 'Primos Goa', rating: 4.5, costPerNight: 3500, bookingLink: 'https://www.booking.com/hotel/in/primos-goa.html', safetyScore: 85, review: { source: 'Booking.com', snippet: '“Right in the middle of the action at Anjuna.”', rating: 4.4 } },
        { id: 'hotel-zostel', name: 'Zostel Goa', rating: 4.3, costPerNight: 1500, bookingLink: 'https://www.zostel.com/zostel/goa/calangute/', safetyScore: 82, review: { source: 'Hostelworld', snippet: '“Classic Zostel vibe, great for meeting people.”', rating: 4.3 } },
        commonHotelOptions[2]
      ],
      commuteOptions: commonCommuteOptions,
      cost: { total: 0, flights: 12000, accommodation: 0, food: 9000, activities: 0, commute: 0 },
      overallSafetyScore: 81,
    },
    {
      id: 'itin-2',
      vibe: 'Chilled Beach Bum',
      title: `South Goa Serenity`,
      description: 'Unwind on pristine beaches, enjoy yoga sessions, and savor fresh seafood in tranquil South Goa.',
      dailyPlan: [
        { day: 1, title: 'Palolem & Agonda Peace', activities: [
            { id: 'act-b-1-1', name: 'Relax at Palolem Beach', duration: 'All day', infoLink: '#', cost: 500, safetyScore: 95, selected: true, review: { source: 'Google', snippet: '“Picture perfect crescent beach. Calm waters and beautiful sunsets.”', rating: 4.8 } },
            { id: 'act-b-1-2', name: 'Silent Noise Disco', duration: '3 hours', infoLink: '#', cost: 1200, safetyScore: 90, selected: false, review: { source: 'TripAdvisor', snippet: '“Unique concept and a lot of fun without the noise pollution.”', rating: 4.3 } },
        ]},
        { day: 2, title: 'Hidden Gems', activities: [
            { id: 'act-b-2-1', name: 'Butterfly Beach', duration: '4 hours', infoLink: '#', cost: 800, safetyScore: 92, selected: true, review: { source: 'Google', snippet: '“A hidden paradise, need to take a boat. Worth it for the seclusion.”', rating: 4.7 } },
            { id: 'act-b-2-2', name: 'Yoga at Kranti Yoga', duration: '2 hours', infoLink: '#', cost: 1000, safetyScore: 98, selected: true, review: { source: 'Yoga Alliance', snippet: '“World-class teachers and a beautiful beachside shala.”', rating: 4.9 } },
        ]},
        { day: 3, title: 'Colva & Departure', activities: [
            { id: 'act-b-3-1', name: 'Explore Colva Beach', duration: '3 hours', infoLink: '#', cost: 300, safetyScore: 88, selected: true, review: { source: 'Google', snippet: '“More commercialized than Palolem but still has a nice vibe.”', rating: 4.2 } },
        ]},
      ],
      hotelOptions: [
        commonHotelOptions[1], // Leela
        { id: 'hotel-art', name: 'Art Resort Goa', rating: 4.6, costPerNight: 8000, bookingLink: 'https://www.booking.com/hotel/in/art-resort.html', safetyScore: 94, review: { source: 'Booking.com', snippet: '“Stylish rooms right on Palolem beach. The restaurant is superb.”', rating: 4.6 } },
        { id: 'hotel-sobti', name: 'Sobit Sarovar Portico', rating: 4.4, costPerNight: 6000, bookingLink: 'https://www.sarovarhotels.com/sobit-sarovar-portico-goa/', safetyScore: 92, review: { source: 'MakeMyTrip', snippet: '“Lovely pool and very comfortable rooms. A bit of a walk to the beach.”', rating: 4.5 } },
        { id: 'hotel-nest', name: 'The Nest', rating: 4.8, costPerNight: 4500, bookingLink: 'https://www.airbnb.co.in/rooms/21456987', safetyScore: 96, review: { source: 'Airbnb', snippet: '“A true gem. The hosts are wonderful and the place is beautiful.”', rating: 4.9 } },
        commonHotelOptions[0],
      ],
      commuteOptions: commonCommuteOptions,
      cost: { total: 0, flights: 12000, accommodation: 0, food: 7000, activities: 0, commute: 0 },
      overallSafetyScore: 93,
    },
    {
      id: 'itin-3',
      vibe: 'Nature & Adventure',
      title: 'Goa\'s Green Heart',
      description: 'Explore spice plantations, majestic waterfalls, and the rich biodiversity of the Western Ghats.',
      dailyPlan: [
        { day: 1, title: 'Spice Plantations & Old Goa', activities: [
            { id: 'act-c-1-1', name: 'Sahakari Spice Farm', duration: '4 hours', infoLink: '#', cost: 1500, safetyScore: 94, selected: true, review: { source: 'Google', snippet: '“Informative tour and a delicious traditional Goan lunch.”', rating: 4.4 } },
            { id: 'act-c-1-2', name: 'Basilica of Bom Jesus', duration: '2 hours', infoLink: '#', cost: 0, safetyScore: 98, selected: true, review: { source: 'TripAdvisor', snippet: '“A must-visit for its stunning architecture and historical significance.”', rating: 4.6 } },
        ]},
        { day: 2, title: 'Waterfalls & Wildlife', activities: [
            { id: 'act-c-2-1', name: 'Dudhsagar Falls Trip', duration: '6-7 hours', infoLink: '#', cost: 2500, safetyScore: 88, selected: true, review: { source: 'Google', snippet: '“The jeep safari is an adventure in itself. The falls are magnificent.”', rating: 4.7 } },
            { id: 'act-c-2-2', name: 'Dr. Salim Ali Bird Sanctuary', duration: '3 hours', infoLink: '#', cost: 500, safetyScore: 95, selected: false, review: { source: 'Google', snippet: '“A peaceful escape. Take the ferry and walk the path.”', rating: 4.3 } },
        ]},
        { day: 3, title: 'Kayaking & Departure', activities: [
            { id: 'act-c-3-1', name: 'Kayaking in the Sal Backwaters', duration: '3 hours', infoLink: '#', cost: 1800, safetyScore: 96, selected: true, review: { source: 'Klook', snippet: '“So serene and beautiful. Saw lots of birds.”', rating: 4.8 } },
        ]},
      ],
      hotelOptions: [
        { id: 'hotel-shangri', name: 'Shangri-La Jungle Village', rating: 4.5, costPerNight: 7000, bookingLink: 'https://www.booking.com/hotel/in/shangrila-jungle-village.html', safetyScore: 92, review: { source: 'Booking.com', snippet: '“Feels like you are in the middle of the jungle. Very unique.”', rating: 4.4 } },
        commonHotelOptions[0],
        commonHotelOptions[1],
        { id: 'hotel-dudhsagar', name: 'Dudhsagar Spa Resort', rating: 4.1, costPerNight: 5500, bookingLink: 'https://www.booking.com/hotel/in/dudhsagar-spa-resort.html', safetyScore: 89, review: { source: 'MakeMyTrip', snippet: '“Convenient for the falls trip. The property is huge.”', rating: 4.0 } },
        commonHotelOptions[2],
      ],
      commuteOptions: commonCommuteOptions.filter(c => c.type === 'Car Rental' || c.type === 'Airport Taxi' || c.type === 'Ride-Sharing'),
      cost: { total: 0, flights: 12000, accommodation: 0, food: 8000, activities: 0, commute: 0 },
      overallSafetyScore: 92,
    },
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
