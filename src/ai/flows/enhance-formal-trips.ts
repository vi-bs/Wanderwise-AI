'use server';
/**
 * @fileOverview Adjusts travel plans for formal trips based on meeting details.
 *
 * - enhanceFormalTrip - Adjusts travel plans for formal trips based on meeting details.
 * - EnhanceFormalTripInput - The input type for the enhanceFormalTrip function.
 * - EnhanceFormalTripOutput - The return type for the enhanceFormalTrip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceFormalTripInputSchema = z.object({
  destination: z.string().describe('The destination of the trip.'),
  duration_days: z.number().describe('The duration of the trip in days.'),
  trip_type: z.literal('formal').describe('The type of trip (formal).'),
  budget_range_inr: z.string().describe('The budget range for the trip in INR.'),
  round_trip: z.boolean().describe('Whether the trip is round trip or one way.'),
  people_count: z.number().describe('The number of people on the trip.'),
  preferences: z.array(z.string()).describe('The preferences for the trip.'),
  travel_dates: z.string().describe('The dates for the trip.'),
  meeting_location: z.string().describe('The location of the meeting.'),
  meeting_duration: z.string().describe('The duration of the meeting.'),
  offline_online: z.string().describe('Whether the meeting is offline or online.'),
  facilities_required: z.array(z.string()).describe('The facilities required for the meeting.'),
});
export type EnhanceFormalTripInput = z.infer<typeof EnhanceFormalTripInputSchema>;

const EnhanceFormalTripOutputSchema = z.object({
  adjusted_stay: z.string().describe('Adjusted stay details based on meeting requirements.'),
  adjusted_transport: z.string().describe('Adjusted transport details based on meeting requirements.'),
  adjusted_schedule: z.string().describe('Adjusted schedule details based on meeting requirements.'),
  adjusted_buffer_times: z.string().describe('Adjusted buffer times based on meeting requirements.'),
});
export type EnhanceFormalTripOutput = z.infer<typeof EnhanceFormalTripOutputSchema>;

export async function enhanceFormalTrip(input: EnhanceFormalTripInput): Promise<EnhanceFormalTripOutput> {
  return enhanceFormalTripFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceFormalTripPrompt',
  input: {schema: EnhanceFormalTripInputSchema},
  output: {schema: EnhanceFormalTripOutputSchema},
  prompt: `You are an expert travel planner specializing in formal business trips. Given the user's initial travel plan and their meeting details, adjust their stay, transport, schedule, and buffer times to ensure a smooth and professional trip.

Original Travel Plan:
Destination: {{{destination}}}
Duration: {{{duration_days}}} days
Trip Type: {{{trip_type}}}
Budget: {{{budget_range_inr}}}
Round Trip: {{{round_trip}}}
People Count: {{{people_count}}}
Preferences: {{#each preferences}}{{{this}}}, {{/each}}
Travel Dates: {{{travel_dates}}}

Meeting Details:
Meeting Location: {{{meeting_location}}}
Meeting Duration: {{{meeting_duration}}}
Offline/Online: {{{offline_online}}}
Facilities Required: {{#each facilities_required}}{{{this}}}, {{/each}}

Adjust the travel plan considering the meeting details:
- Stay: Recommend accommodations close to the meeting location with appropriate facilities.
- Transport: Suggest the best mode of transport considering the meeting schedule and location.
- Schedule: Create a detailed schedule that incorporates the meeting and allows for preparation and travel time.
- Buffer Times: Add buffer times to account for potential delays and ensure the user arrives on time for the meeting.

Output the adjusted stay, transport, schedule and buffer times. Make sure the output is easily parsable.

{
  "adjusted_stay": "",
  "adjusted_transport": "",
  "adjusted_schedule": "",
  "adjusted_buffer_times": ""
}
`,
});

const enhanceFormalTripFlow = ai.defineFlow(
  {
    name: 'enhanceFormalTripFlow',
    inputSchema: EnhanceFormalTripInputSchema,
    outputSchema: EnhanceFormalTripOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
