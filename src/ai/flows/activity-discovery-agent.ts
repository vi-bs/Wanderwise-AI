'use server';

/**
 * @fileOverview Activity Discovery Agent - Finds and curates activities for any destination
 * This agent specializes in discovering authentic local experiences, attractions, and activities
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ActivityDiscoveryInputSchema = z.object({
  destination: z.string().describe('The travel destination'),
  duration_days: z.number().describe('Duration of the trip in days'),
  preferences: z.array(z.string()).describe('Travel preferences and interests'),
  budget_range_inr: z.string().describe('Budget range in INR'),
  people_count: z.number().describe('Number of travelers'),
  travel_dates: z.string().describe('Travel dates or season'),
  destinationIntelligence: z.object({
    climate: z.object({
      season: z.string(),
      temperature: z.string(),
      rainfall: z.string(),
    }),
    culture: z.object({
      festivals: z.array(z.string()),
      customs: z.array(z.string()),
    }),
    costs: z.object({
      activities: z.object({
        free: z.array(z.string()),
        budgetRange: z.object({
          min: z.number(),
          max: z.number(),
        }),
      }),
    }),
  }).describe('Intelligence about the destination from the destination agent'),
});

export type ActivityDiscoveryInput = z.infer<typeof ActivityDiscoveryInputSchema>;

const ActivityCategorySchema = z.object({
  category: z.string().describe('Activity category (e.g., Cultural, Adventure, Food, Nature, etc.)'),
  activities: z.array(z.object({
    id: z.string().describe('Unique activity ID'),
    name: z.string().describe('Activity name'),
    description: z.string().describe('Detailed description of the activity'),
    duration: z.string().describe('Expected duration (e.g., "2-3 hours", "Half day")'),
    cost: z.number().describe('Cost in INR (0 for free activities)'),
    location: z.string().describe('Specific location or area'),
    bestTimeToVisit: z.string().describe('Best time of day or season'),
    difficulty: z.enum(['Easy', 'Moderate', 'Challenging']).describe('Physical difficulty level'),
    groupSize: z.object({
      min: z.number().describe('Minimum group size'),
      max: z.number().describe('Maximum group size'),
    }),
    bookingRequired: z.boolean().describe('Whether advance booking is required'),
    bookingInfo: z.string().describe('How to book or access this activity'),
    safetyScore: z.number().min(0).max(100).describe('Safety score 0-100'),
    localTips: z.array(z.string()).describe('Local tips and insider knowledge'),
    seasonality: z.string().describe('Seasonal availability or considerations'),
    alternatives: z.array(z.string()).describe('Alternative similar activities'),
  })),
});

const DailyThemeSchema = z.object({
  day: z.number().describe('Day number'),
  theme: z.string().describe('Theme for the day (e.g., "Cultural Immersion", "Adventure Day")'),
  description: z.string().describe('Description of the day\'s focus'),
  recommendedActivities: z.array(z.string()).describe('Activity IDs recommended for this day'),
  logisticalNotes: z.array(z.string()).describe('Logistical considerations for the day'),
});

const ActivityDiscoveryOutputSchema = z.object({
  destination: z.string().describe('Destination name'),
  totalActivitiesFound: z.number().describe('Total number of activities discovered'),
  categories: z.array(ActivityCategorySchema).describe('Activities organized by category'),
  dailyThemes: z.array(DailyThemeSchema).describe('Suggested daily themes and activity combinations'),
  hiddenGems: z.array(z.string()).describe('Lesser-known local experiences'),
  seasonalHighlights: z.array(z.string()).describe('Special activities available during travel dates'),
  budgetBreakdown: z.object({
    free: z.number().describe('Number of free activities'),
    budget: z.number().describe('Number of budget activities (under ₹1000)'),
    midRange: z.number().describe('Number of mid-range activities (₹1000-5000)'),
    premium: z.number().describe('Number of premium activities (above ₹5000)'),
  }),
  localExpertTips: z.array(z.string()).describe('Expert tips from locals'),
});

export type ActivityDiscoveryOutput = z.infer<typeof ActivityDiscoveryOutputSchema>;

const activityDiscoveryPrompt = ai.definePrompt({
  name: 'activityDiscoveryPrompt',
  input: { schema: ActivityDiscoveryInputSchema },
  output: { schema: ActivityDiscoveryOutputSchema },
  prompt: `You are a local activity discovery expert with deep knowledge of authentic experiences worldwide. Your mission is to uncover both popular attractions and hidden gems that match the traveler's preferences.

TRAVELER PROFILE:
- Destination: {{{destination}}}
- Duration: {{{duration_days}}} days
- Group Size: {{{people_count}}} people
- Budget: ₹{{{budget_range_inr}}}
- Preferences: {{#each preferences}}{{{this}}}, {{/each}}
- Travel Dates: {{{travel_dates}}}

DESTINATION CONTEXT:
- Season: {{{destinationIntelligence.climate.season}}}
- Temperature: {{{destinationIntelligence.climate.temperature}}}
- Local Festivals: {{#each destinationIntelligence.culture.festivals}}{{{this}}}, {{/each}}
- Free Activities Available: {{#each destinationIntelligence.costs.activities.free}}{{{this}}}, {{/each}}

DISCOVERY REQUIREMENTS:
1. **Authentic Experiences**: Prioritize genuine local experiences over tourist traps
2. **Diverse Categories**: Include cultural, adventure, food, nature, nightlife, shopping, etc.
3. **Budget Sensitivity**: Provide options across all budget ranges
4. **Seasonal Relevance**: Consider weather and seasonal availability
5. **Group Dynamics**: Consider activities suitable for the group size
6. **Local Insights**: Include insider tips and local knowledge
7. **Practical Information**: Provide realistic costs, booking info, and logistics

ACTIVITY RESEARCH FOCUS:
- Research destination-specific activities (not generic tourist activities)
- Include unique local experiences (cooking classes, local festivals, etc.)
- Consider the travel dates for seasonal activities
- Factor in local customs and cultural sensitivities
- Include both day and evening activities
- Consider transportation requirements for each activity

DAILY THEME STRATEGY:
- Create logical daily themes that flow well together
- Consider geographical proximity of activities
- Balance active and relaxing activities
- Account for travel time between locations
- Include buffer time for spontaneous discoveries

Discover comprehensive, authentic, and practical activities that will create memorable experiences for these travelers.`,
});

const activityDiscoveryFlow = ai.defineFlow(
  {
    name: 'activityDiscoveryFlow',
    inputSchema: ActivityDiscoveryInputSchema,
    outputSchema: ActivityDiscoveryOutputSchema,
  },
  async (input) => {
    const { output } = await activityDiscoveryPrompt(input);
    if (!output) {
      throw new Error('Failed to discover activities');
    }
    return output;
  }
);

export async function discoverActivities(
  input: ActivityDiscoveryInput
): Promise<ActivityDiscoveryOutput> {
  console.log('Discovering activities for:', input.destination);
  
  try {
    const result = await activityDiscoveryFlow(input);
    return result;
  } catch (error) {
    console.error('Error discovering activities:', error);
    throw new Error(`Failed to discover activities for: ${input.destination}`);
  }
}