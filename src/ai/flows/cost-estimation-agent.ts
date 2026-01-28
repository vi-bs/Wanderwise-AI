'use server';

/**
 * @fileOverview Cost Estimation Agent - Provides accurate cost estimates for any destination
 * This agent specializes in realistic cost calculations including flights, local expenses, and hidden costs
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CostEstimationInputSchema = z.object({
  destination: z.string().describe('The travel destination'),
  origin: z.string().default('India').describe('Origin country/city'),
  duration_days: z.number().describe('Duration of the trip in days'),
  people_count: z.number().describe('Number of travelers'),
  travel_dates: z.string().describe('Travel dates or season'),
  budget_range_inr: z.string().describe('Desired budget range in INR'),
  preferences: z.array(z.string()).describe('Travel preferences affecting costs'),
  destinationIntelligence: z.object({
    currency: z.object({
      local: z.string(),
      exchangeRate: z.number(),
    }),
    costs: z.object({
      meals: z.object({
        budget: z.number(),
        midRange: z.number(),
        luxury: z.number(),
      }),
    }),
  }).describe('Cost intelligence from destination agent'),
  accommodationOptions: z.array(z.object({
    category: z.string(),
    costPerNight: z.number(),
  })).describe('Available accommodation options'),
  activities: z.array(z.object({
    name: z.string(),
    cost: z.number(),
    category: z.string(),
  })).describe('Available activities and their costs'),
});

export type CostEstimationInput = z.infer<typeof CostEstimationInputSchema>;

const FlightCostSchema = z.object({
  route: z.string().describe('Flight route (e.g., "Delhi to Bangkok")'),
  airline: z.string().describe('Example airline'),
  economyClass: z.object({
    min: z.number().describe('Minimum cost in INR'),
    max: z.number().describe('Maximum cost in INR'),
    average: z.number().describe('Average cost in INR'),
  }),
  businessClass: z.object({
    min: z.number().describe('Minimum cost in INR'),
    max: z.number().describe('Maximum cost in INR'),
    average: z.number().describe('Average cost in INR'),
  }),
  seasonalFactors: z.array(z.string()).describe('Factors affecting flight prices'),
  bookingTips: z.array(z.string()).describe('Tips for getting better flight deals'),
});

const LocalTransportCostSchema = z.object({
  type: z.string().describe('Transport type'),
  dailyCost: z.object({
    min: z.number().describe('Minimum daily cost in INR'),
    max: z.number().describe('Maximum daily cost in INR'),
    average: z.number().describe('Average daily cost in INR'),
  }),
  totalTripCost: z.number().describe('Estimated total cost for the trip'),
  costFactors: z.array(z.string()).describe('Factors affecting transport costs'),
});

const AccommodationCostSchema = z.object({
  category: z.string().describe('Accommodation category'),
  costPerNight: z.object({
    min: z.number().describe('Minimum cost per night in INR'),
    max: z.number().describe('Maximum cost per night in INR'),
    average: z.number().describe('Average cost per night in INR'),
  }),
  totalCost: z.number().describe('Total accommodation cost for the trip'),
  seasonalVariation: z.string().describe('How costs vary by season'),
});

const FoodCostSchema = z.object({
  category: z.string().describe('Food category (Budget, Mid-range, Luxury)'),
  dailyCost: z.object({
    breakfast: z.number().describe('Average breakfast cost in INR'),
    lunch: z.number().describe('Average lunch cost in INR'),
    dinner: z.number().describe('Average dinner cost in INR'),
    total: z.number().describe('Total daily food cost in INR'),
  }),
  totalTripCost: z.number().describe('Total food cost for the trip'),
  localTips: z.array(z.string()).describe('Tips for saving on food costs'),
});

const ActivityCostSchema = z.object({
  category: z.string().describe('Activity category'),
  averageCost: z.number().describe('Average cost per activity in INR'),
  recommendedBudget: z.number().describe('Recommended total budget for activities'),
  freeOptions: z.number().describe('Number of free activities available'),
  costSavingTips: z.array(z.string()).describe('Tips for saving on activity costs'),
});

const HiddenCostSchema = z.object({
  type: z.string().describe('Type of hidden cost'),
  description: z.string().describe('Description of the cost'),
  estimatedCost: z.number().describe('Estimated cost in INR'),
  avoidanceTips: z.array(z.string()).describe('Tips to avoid or minimize this cost'),
});

const CostEstimationOutputSchema = z.object({
  destination: z.string().describe('Destination name'),
  totalTripCost: z.object({
    budget: z.number().describe('Budget trip total cost in INR'),
    midRange: z.number().describe('Mid-range trip total cost in INR'),
    luxury: z.number().describe('Luxury trip total cost in INR'),
  }),
  costBreakdown: z.object({
    flights: FlightCostSchema.describe('Flight cost analysis'),
    accommodation: z.array(AccommodationCostSchema).describe('Accommodation cost options'),
    food: z.array(FoodCostSchema).describe('Food cost options'),
    localTransport: z.array(LocalTransportCostSchema).describe('Local transport costs'),
    activities: ActivityCostSchema.describe('Activity cost analysis'),
    shopping: z.object({
      souvenirs: z.number().describe('Estimated souvenir budget in INR'),
      shopping: z.number().describe('Estimated shopping budget in INR'),
    }),
    miscellaneous: z.number().describe('Miscellaneous expenses in INR'),
  }),
  hiddenCosts: z.array(HiddenCostSchema).describe('Potential hidden or unexpected costs'),
  budgetOptimization: z.object({
    costSavingTips: z.array(z.string()).describe('General cost-saving strategies'),
    budgetAllocation: z.object({
      flights: z.number().describe('Recommended % of budget for flights'),
      accommodation: z.number().describe('Recommended % of budget for accommodation'),
      food: z.number().describe('Recommended % of budget for food'),
      activities: z.number().describe('Recommended % of budget for activities'),
      transport: z.number().describe('Recommended % of budget for transport'),
      contingency: z.number().describe('Recommended % of budget for contingency'),
    }),
    seasonalAdvice: z.array(z.string()).describe('Seasonal cost optimization advice'),
  }),
  currencyInfo: z.object({
    localCurrency: z.string().describe('Local currency'),
    exchangeRate: z.number().describe('Current exchange rate to INR'),
    exchangeTips: z.array(z.string()).describe('Currency exchange tips'),
  }),
  paymentAdvice: z.array(z.string()).describe('Payment method recommendations'),
});

export type CostEstimationOutput = z.infer<typeof CostEstimationOutputSchema>;

const costEstimationPrompt = ai.definePrompt({
  name: 'costEstimationPrompt',
  input: { schema: CostEstimationInputSchema },
  output: { schema: CostEstimationOutputSchema },
  prompt: `You are a travel cost estimation expert with access to current pricing data worldwide. Provide accurate, realistic cost estimates for this trip.

TRIP DETAILS:
- Destination: {{{destination}}}
- Origin: {{{origin}}}
- Duration: {{{duration_days}}} days
- Travelers: {{{people_count}}} people
- Travel Dates: {{{travel_dates}}}
- Budget Range: ₹{{{budget_range_inr}}}
- Preferences: {{#each preferences}}{{{this}}}, {{/each}}

DESTINATION COST CONTEXT:
- Local Currency: {{{destinationIntelligence.currency.local}}}
- Exchange Rate: {{{destinationIntelligence.currency.exchangeRate}}} to INR
- Daily Food Costs: Budget ₹{{{destinationIntelligence.costs.meals.budget}}}, Mid-range ₹{{{destinationIntelligence.costs.meals.midRange}}}, Luxury ₹{{{destinationIntelligence.costs.meals.luxury}}}

AVAILABLE ACCOMMODATION OPTIONS:
{{#each accommodationOptions}}
- {{{category}}}: ₹{{{costPerNight}}}/night
{{/each}}

AVAILABLE ACTIVITIES:
{{#each activities}}
- {{{name}}} ({{{category}}}): ₹{{{cost}}}
{{/each}}

COST ESTIMATION REQUIREMENTS:
1. **Current Pricing**: Use current market rates and seasonal factors
2. **Comprehensive Analysis**: Include all major cost categories
3. **Hidden Costs**: Identify potential unexpected expenses
4. **Budget Tiers**: Provide budget, mid-range, and luxury options
5. **Optimization**: Suggest cost-saving strategies
6. **Seasonal Factors**: Consider how travel dates affect costs
7. **Group Dynamics**: Factor in group size for cost sharing opportunities

FLIGHT COST ANALYSIS:
- Research current flight prices from India to the destination
- Consider seasonal variations and booking timing
- Include both economy and business class options
- Factor in potential layovers and airline choices

ACCOMMODATION COST ANALYSIS:
- Analyze costs across different accommodation categories
- Consider location premiums and seasonal pricing
- Factor in group size for room sharing possibilities
- Include unique local accommodation options

FOOD COST ANALYSIS:
- Research local food prices and dining options
- Consider street food vs. restaurant pricing
- Factor in dietary preferences and restrictions
- Include cooking facilities impact on costs

ACTIVITY COST ANALYSIS:
- Analyze costs for different activity categories
- Include free and low-cost options
- Consider group discounts and package deals
- Factor in equipment rental or guide costs

HIDDEN COST IDENTIFICATION:
- Tourist taxes and fees
- Visa and documentation costs
- Travel insurance
- Tipping customs
- Airport transfers
- Baggage fees
- Communication costs (SIM cards, roaming)
- Emergency fund requirements

Provide realistic, actionable cost estimates that help travelers plan their budget effectively.`,
});

const costEstimationFlow = ai.defineFlow(
  {
    name: 'costEstimationFlow',
    inputSchema: CostEstimationInputSchema,
    outputSchema: CostEstimationOutputSchema,
  },
  async (input) => {
    const { output } = await costEstimationPrompt(input);
    if (!output) {
      throw new Error('Failed to estimate costs');
    }
    return output;
  }
);

export async function estimateTripCosts(
  input: CostEstimationInput
): Promise<CostEstimationOutput> {
  console.log('Estimating costs for:', input.destination);
  
  try {
    const result = await costEstimationFlow(input);
    return result;
  } catch (error) {
    console.error('Error estimating costs:', error);
    throw new Error(`Failed to estimate costs for: ${input.destination}`);
  }
}