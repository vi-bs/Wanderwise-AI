
'use server';

/**
 * @fileOverview Generates personalized travel itineraries based on user input using an n8n multi-agent workflow.
 *
 * - generatePersonalizedItineraries - A function that triggers the n8n workflow and returns the generated itineraries.
 * - GeneratePersonalizedItinerariesInput - The input type for the generatePersonalizedItineraries function.
 * - GeneratePersonalizedItinerariesOutput - The return type for the generatePersonalizedItineraries function.
 */

import {z} from 'genkit';

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
export type GeneratePersonalizedItinerariesInput = z.infer<
  typeof GeneratePersonalizedItinerariesInputSchema
>;

const GeneratePersonalizedItinerariesOutputSchema = z.object({
  itineraries: z.array(z.any()).describe('An array of generated travel itineraries.'),
  // Define the structure of an itinerary object based on the n8n workflow output
  // For now, using z.any() as the exact structure is determined by the n8n workflow
});
export type GeneratePersonalizedItinerariesOutput = z.infer<
  typeof GeneratePersonalizedItinerariesOutputSchema
>;

export async function generatePersonalizedItineraries(
  input: GeneratePersonalizedItinerariesInput
): Promise<GeneratePersonalizedItinerariesOutput> {
  // MOCK IMPLEMENTATION: Return sample data instead of calling n8n.
  console.log("Returning mock itinerary data for input:", input);
  
  // Adding a short delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 2000));

  const mockItineraries = [
      {
        "id": "itin-1",
        "vibe": "Relaxed Explorer",
        "title": "Sunsets & Spices",
        "description": "A laid-back journey focusing on Goa's beautiful beaches, delicious food, and relaxed atmosphere. Perfect for unwinding and soaking up the sun.",
        "dailyPlan": [
          { "day": 1, "title": "Arrival and Beach Relaxation", "activities": ["Arrive in Goa, check into a beachside resort in Candolim.", "Relax on the beach and watch the sunset.", "Dinner at a local beach shack."] },
          { "day": 2, "title": "North Goa Exploration", "activities": ["Visit the historic Fort Aguada for panoramic views.", "Explore the Anjuna Flea Market (if it's a Wednesday).", "Enjoy the nightlife at Baga Beach."] },
          { "day": 3, "title": "South Goa Serenity", "activities": ["Take a day trip to the quieter beaches of South Goa like Palolem or Agonda.", "Try kayaking or paddleboarding.", "Enjoy a seafood dinner at a serene restaurant."] },
          { "day": 4, "title": "Spice Plantations & Old Goa", "activities": ["Visit a local spice plantation to learn about Indian spices.", "Explore the UNESCO World Heritage sites of Old Goa, including the Basilica of Bom Jesus.", "Farewell dinner with traditional Goan music."] }
        ],
        "cost": { "total": "₹45,000", "flights": "₹15,000", "accommodation": "₹20,000", "food": "₹7,000", "activities": "₹3,000" }
      },
      {
        "id": "itin-2",
        "vibe": "Adventure Seeker",
        "title": "Goa Adrenaline Rush",
        "description": "An action-packed trip for those who want to experience the adventurous side of Goa, from water sports to jungle treks.",
        "dailyPlan": [
          { "day": 1, "title": "Water Sports & Arrival", "activities": ["Arrive and check in near Calangute.", "Hit the beach for parasailing and jet skiing.", "Evening at a lively beach club."] },
          { "day": 2, "title": "Dudhsagar Falls Expedition", "activities": ["Full-day trip to Dudhsagar Falls.", "Jeep safari through the jungle to reach the falls.", "Swim in the natural pool at the base of the waterfall."] },
          { "day": 3, "title": "Scuba Diving & Island Trip", "activities": ["Take a boat to Grand Island for a scuba diving session.", "Snorkeling and dolphin spotting.", "Relaxed evening exploring Panjim."] },
          { "day": 4, "title": "Trekking & Departure", "activities": ["Morning trek in the Netravali Wildlife Sanctuary.", "Visit a hidden waterfall.", "Depart from Goa with adventurous memories."] }
        ],
        "cost": { "total": "₹55,000", "flights": "₹15,000", "accommodation": "₹22,000", "food": "₹8,000", "activities": "₹10,000" }
      },
      {
        "id": "itin-3",
        "vibe": "Cultural Enthusiast",
        "title": "Goan Heritage Trail",
        "description": "Immerse yourself in the rich history and unique culture of Goa, exploring its Portuguese heritage, ancient temples, and artistic side.",
        "dailyPlan": [
          { "day": 1, "title": "Fontainhas & Panjim", "activities": ["Check into a heritage hotel in Panjim.", "Explore the colorful Latin Quarter of Fontainhas.", "Evening river cruise on the Mandovi."] },
          { "day": 2, "title": "Churches & Temples", "activities": ["Explore the historic churches of Old Goa.", "Visit the Mangueshi and Shanta Durga temples.", "Attend a traditional Goan cooking class."] },
          { "day": 3, "title": "Art & History", "activities": ["Visit the Goa State Museum and the Museum of Christian Art.", "Explore a local art gallery.", "Enjoy a Fado performance in the evening."] },
          { "day": 4, "title": "Ancestral Homes & Departure", "activities": ["Visit a preserved ancestral Goan home like the Figueiredo Mansion.", "Last-minute souvenir shopping.", "Depart with a deeper understanding of Goan culture."] }
        ],
        "cost": { "total": "₹50,000", "flights": "₹15,000", "accommodation": "₹25,000", "food": "₹7,000", "activities": "₹3,000" }
      }
    ];

  return { itineraries: mockItineraries };
}
