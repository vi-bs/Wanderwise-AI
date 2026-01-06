
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
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error(
      'N8N_WEBHOOK_URL environment variable is not set.  Please configure it in your .env file.'
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('n8n webhook error:', errorBody);
      throw new Error(`n8n webhook failed with status ${response.status}`);
    }

    const result = await response.json();
    
    // The n8n workflow might return the data in a nested structure.
    // We'll try to find the itineraries array.
    if (Array.isArray(result)) {
        return { itineraries: result };
    }
    if (result.itineraries && Array.isArray(result.itineraries)) {
        return { itineraries: result.itineraries };
    }
    if (Array.isArray(result.data) && result.data[0] && result.data[0].json && Array.isArray(result.data[0].json.itineraries)) {
        return { itineraries: result.data[0].json.itineraries };
    }
    
    console.warn("Could not find 'itineraries' array in n8n response.", result);
    // Return an empty array if the structure is unexpected, to avoid crashing the client.
    return { itineraries: [] };

  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    throw new Error('Failed to fetch itineraries from n8n workflow.');
  }
}
