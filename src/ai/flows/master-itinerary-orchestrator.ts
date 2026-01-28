'use server';

/**
 * @fileOverview Master Itinerary Orchestrator - Coordinates all specialized agents
 * This orchestrator manages the multi-agent workflow to create comprehensive, realistic itineraries
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { gatherDestinationIntelligence } from './destination-intelligence-agent';
import { discoverActivities } from './activity-discovery-agent';
import { findAccommodationOptions } from './accommodation-booking-agent';
import { estimateTripCosts } from './cost-estimation-agent';

const MasterOrchestratorInputSchema = z.object({
  destination: z.string().describe('The travel destination'),
  duration_days: z.string().describe('Duration of the trip in days'),
  trip_type: z.enum(['formal', 'informal']).describe('Type of trip'),
  budget_range_inr: z.string().describe('Budget range in INR'),
  round_trip: z.boolean().describe('Whether the trip is round trip'),
  people_count: z.string().describe('Number of people traveling'),
  preferences: z.array(z.string()).describe('Travel preferences'),
  travel_dates: z.string().describe('Travel dates'),
});

export type MasterOrchestratorInput = z.infer<typeof MasterOrchestratorInputSchema>;

// Enhanced schemas that incorporate multi-agent data
const EnhancedActivitySchema = z.object({
  id: z.string().describe('Unique activity ID'),
  name: z.string().describe('Activity name'),
  duration: z.string().describe('Duration (e.g., "2-3 hours")'),
  infoLink: z.string().url().describe('Information or booking link'),
  cost: z.number().describe('Cost in INR'),
  safetyScore: z.number().min(0).max(100).describe('Safety score 0-100'),
  selected: z.boolean().describe('Default selection status'),
  review: z.object({
    source: z.string().describe('Review source'),
    snippet: z.string().describe('Review excerpt'),
    rating: z.number().describe('Review rating'),
  }),
  category: z.string().describe('Activity category'),
  location: z.string().describe('Specific location'),
  difficulty: z.enum(['Easy', 'Moderate', 'Challenging']).describe('Difficulty level'),
  bookingRequired: z.boolean().describe('Whether booking is required'),
  localTips: z.array(z.string()).describe('Local tips'),
});

const EnhancedHotelSchema = z.object({
  id: z.string().describe('Unique hotel ID'),
  name: z.string().describe('Hotel name'),
  rating: z.number().describe('Star rating'),
  costPerNight: z.number().describe('Cost per night in INR'),
  bookingLink: z.string().url().describe('Booking link'),
  safetyScore: z.number().min(0).max(100).describe('Safety score'),
  review: z.object({
    source: z.string().describe('Review source'),
    snippet: z.string().describe('Review excerpt'),
    rating: z.number().describe('Review rating'),
  }),
  category: z.string().describe('Hotel category'),
  location: z.object({
    area: z.string().describe('Area name'),
    distanceToCenter: z.string().describe('Distance to center'),
  }),
  amenities: z.array(z.string()).describe('Available amenities'),
  uniqueFeatures: z.array(z.string()).describe('Unique features'),
});

const EnhancedCommuteSchema = z.object({
  id: z.string().describe('Unique commute ID'),
  type: z.string().describe('Transport type (dynamic based on destination)'),
  cost: z.number().describe('Daily or per-trip cost in INR'),
  infoLink: z.string().url().describe('Information or booking link'),
  pros: z.array(z.string()).describe('Advantages'),
  cons: z.array(z.string()).describe('Disadvantages'),
  safetyScore: z.number().min(0).max(100).describe('Safety score'),
  availability: z.string().describe('Availability information'),
  bookingInfo: z.string().describe('How to book'),
});

const EnhancedDailyPlanSchema = z.object({
  day: z.number().describe('Day number'),
  title: z.string().describe('Day title'),
  theme: z.string().describe('Day theme'),
  activities: z.array(EnhancedActivitySchema).describe('Activities for the day'),
  logisticalNotes: z.array(z.string()).describe('Logistical considerations'),
  estimatedCost: z.number().describe('Estimated cost for the day'),
});

const EnhancedItinerarySchema = z.object({
  id: z.string().describe('Unique itinerary ID'),
  vibe: z.string().describe('Itinerary vibe'),
  title: z.string().describe('Itinerary title'),
  description: z.string().describe('Itinerary description'),
  dailyPlan: z.array(EnhancedDailyPlanSchema).describe('Daily plans'),
  hotelOptions: z.array(EnhancedHotelSchema).min(3).max(6).describe('Hotel options'),
  commuteOptions: z.array(EnhancedCommuteSchema).min(3).max(6).describe('Transport options'),
  cost: z.object({
    total: z.number().default(0),
    flights: z.number().describe('Flight cost estimate'),
    accommodation: z.number().default(0),
    food: z.number().describe('Daily food cost estimate'),
    activities: z.number().default(0),
    commute: z.number().default(0),
  }),
  overallSafetyScore: z.number().min(0).max(100).describe('Overall safety score'),
  uniqueExperiences: z.array(z.string()).describe('Unique experiences in this itinerary'),
  localInsights: z.array(z.string()).describe('Local insights and tips'),
});

const MasterOrchestratorOutputSchema = z.object({
  itineraries: z.array(EnhancedItinerarySchema).min(3).max(3).describe('Three distinct itineraries'),
  destinationOverview: z.object({
    destination: z.string().describe('Destination name'),
    bestTimeToVisit: z.string().describe('Best time to visit'),
    currency: z.string().describe('Local currency'),
    language: z.string().describe('Primary language'),
    safetyOverview: z.string().describe('General safety information'),
    culturalTips: z.array(z.string()).describe('Important cultural tips'),
  }),
  budgetGuidance: z.object({
    recommendedBudget: z.object({
      budget: z.number().describe('Budget trip cost'),
      midRange: z.number().describe('Mid-range trip cost'),
      luxury: z.number().describe('Luxury trip cost'),
    }),
    costSavingTips: z.array(z.string()).describe('Cost-saving strategies'),
    hiddenCosts: z.array(z.string()).describe('Potential hidden costs'),
  }),
});

export type MasterOrchestratorOutput = z.infer<typeof MasterOrchestratorOutputSchema>;

const itinerarySynthesisPrompt = ai.definePrompt({
  name: 'itinerarySynthesisPrompt',
  input: { 
    schema: z.object({
      userInput: MasterOrchestratorInputSchema,
      destinationData: z.any(),
      activityData: z.any(),
      accommodationData: z.any(),
      costData: z.any(),
    })
  },
  output: { schema: MasterOrchestratorOutputSchema },
  prompt: `You are a master travel planner synthesizing insights from multiple specialized agents to create exceptional itineraries.

USER REQUEST:
- Destination: {{{userInput.destination}}}
- Duration: {{{userInput.duration_days}}} days
- Budget: ₹{{{userInput.budget_range_inr}}}
- Travelers: {{{userInput.people_count}}} people
- Preferences: {{#each userInput.preferences}}{{{this}}}, {{/each}}
- Travel Dates: {{{userInput.travel_dates}}}

AGENT INTELLIGENCE SUMMARY:
The destination intelligence agent has provided comprehensive local knowledge including transportation options, cultural context, and safety information. The activity discovery agent has identified authentic local experiences across multiple categories. The accommodation booking agent has found realistic lodging options with real booking links. The cost estimation agent has provided detailed budget breakdowns.

SYNTHESIS REQUIREMENTS:
1. **Create 3 Distinct Itineraries**: Each with a unique vibe and focus
2. **Integrate Agent Data**: Seamlessly combine insights from all agents
3. **Ensure Authenticity**: All recommendations must be realistic and actionable
4. **Optimize Logistics**: Create logical daily flows and practical schedules
5. **Balance Experiences**: Mix popular attractions with hidden gems
6. **Consider Budget**: Provide options across different price points
7. **Cultural Sensitivity**: Incorporate cultural insights and etiquette

ITINERARY CREATION STRATEGY:
- Vibe 1: Focus on cultural immersion and authentic local experiences
- Vibe 2: Balance adventure/activities with relaxation
- Vibe 3: Emphasize unique experiences and hidden gems

For each itinerary:
- Create logical daily themes that flow well together
- Include a mix of must-see attractions and local experiences
- Balance active and relaxing activities
- Consider travel time between locations
- Incorporate local dining and cultural experiences
- Provide practical logistics and local tips

ACCOMMODATION INTEGRATION:
- Select hotels that match each itinerary's vibe
- Ensure realistic pricing and availability
- Include diverse options (luxury, mid-range, budget)
- Consider location relevance to planned activities

TRANSPORTATION INTEGRATION:
- Include destination-specific transport options
- Provide realistic costs and booking information
- Consider safety and convenience factors
- Match transport to itinerary style

COST INTEGRATION:
- Provide realistic cost estimates based on agent analysis
- Include flight costs from India
- Factor in seasonal pricing variations
- Suggest cost optimization strategies

Create comprehensive, realistic, and exciting itineraries that showcase the best of the destination while meeting the traveler's specific needs and preferences.`,
});

const masterOrchestratorFlow = ai.defineFlow(
  {
    name: 'masterOrchestratorFlow',
    inputSchema: MasterOrchestratorInputSchema,
    outputSchema: MasterOrchestratorOutputSchema,
  },
  async (input) => {
    console.log('🚀 Starting multi-agent itinerary generation for:', input.destination);
    
    // Convert string inputs to numbers for agent compatibility
    const durationDays = parseInt(input.duration_days);
    const peopleCount = parseInt(input.people_count);
    
    try {
      // Phase 1: Gather destination intelligence
      console.log('📍 Phase 1: Gathering destination intelligence...');
      const destinationData = await gatherDestinationIntelligence({
        destination: input.destination,
        duration_days: durationDays,
        budget_range_inr: input.budget_range_inr,
        travel_dates: input.travel_dates,
        people_count: peopleCount,
      });
      
      // Phase 2: Discover activities (parallel with accommodation search)
      console.log('🎯 Phase 2: Discovering activities and accommodation...');
      const [activityData, accommodationData] = await Promise.all([
        discoverActivities({
          destination: input.destination,
          duration_days: durationDays,
          preferences: input.preferences,
          budget_range_inr: input.budget_range_inr,
          people_count: peopleCount,
          travel_dates: input.travel_dates,
          destinationIntelligence: {
            climate: destinationData.climate,
            culture: destinationData.culture,
            costs: destinationData.costs,
          },
        }),
        findAccommodationOptions({
          destination: input.destination,
          duration_days: durationDays,
          budget_range_inr: input.budget_range_inr,
          people_count: peopleCount,
          travel_dates: input.travel_dates,
          preferences: input.preferences,
          destinationIntelligence: {
            accommodation: destinationData.accommodation,
            currency: destinationData.currency,
          },
        }),
      ]);
      
      // Phase 3: Estimate costs
      console.log('💰 Phase 3: Estimating costs...');
      const costData = await estimateTripCosts({
        destination: input.destination,
        duration_days: durationDays,
        people_count: peopleCount,
        travel_dates: input.travel_dates,
        budget_range_inr: input.budget_range_inr,
        preferences: input.preferences,
        destinationIntelligence: {
          currency: destinationData.currency,
          costs: destinationData.costs,
        },
        accommodationOptions: accommodationData.accommodationOptions.map(acc => ({
          category: acc.category,
          costPerNight: acc.pricing.costPerNight,
        })),
        activities: activityData.categories.flatMap(cat => 
          cat.activities.map(act => ({
            name: act.name,
            cost: act.cost,
            category: cat.category,
          }))
        ),
      });
      
      // Phase 4: Synthesize everything into comprehensive itineraries
      console.log('🎨 Phase 4: Synthesizing comprehensive itineraries...');
      const { output } = await itinerarySynthesisPrompt({
        userInput: input,
        destinationData,
        activityData,
        accommodationData,
        costData,
      });
      
      if (!output) {
        throw new Error('Failed to synthesize itineraries');
      }
      
      console.log('✅ Multi-agent itinerary generation completed successfully!');
      return output;
      
    } catch (error) {
      console.error('❌ Error in multi-agent orchestration:', error);
      throw new Error(`Failed to generate itineraries: ${error.message}`);
    }
  }
);

export async function generateComprehensiveItineraries(
  input: MasterOrchestratorInput
): Promise<MasterOrchestratorOutput> {
  console.log('🎯 Initiating comprehensive itinerary generation for:', input.destination);
  
  try {
    const result = await masterOrchestratorFlow(input);
    return result;
  } catch (error) {
    console.error('Error in master orchestrator:', error);
    throw new Error(`Failed to generate comprehensive itineraries: ${error.message}`);
  }
}