'use server';

/**
 * @fileOverview Destination Intelligence Agent - Gathers comprehensive information about any destination
 * This agent specializes in understanding destinations, local transportation, costs, and cultural context
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DestinationIntelligenceInputSchema = z.object({
  destination: z.string().describe('The travel destination (city, country, or region)'),
  duration_days: z.number().describe('Duration of the trip in days'),
  budget_range_inr: z.string().describe('Budget range in INR'),
  travel_dates: z.string().describe('Travel dates or season'),
  people_count: z.number().describe('Number of travelers'),
});

export type DestinationIntelligenceInput = z.infer<typeof DestinationIntelligenceInputSchema>;

const LocalTransportSchema = z.object({
  type: z.string().describe('Type of transport (e.g., Metro, Tuk-tuk, Ferry, etc.)'),
  availability: z.string().describe('Availability and coverage'),
  costRange: z.object({
    min: z.number().describe('Minimum cost per day/trip in INR'),
    max: z.number().describe('Maximum cost per day/trip in INR'),
  }),
  pros: z.array(z.string()).describe('Advantages of this transport'),
  cons: z.array(z.string()).describe('Disadvantages of this transport'),
  safetyScore: z.number().min(0).max(100).describe('Safety score 0-100'),
  bookingInfo: z.string().describe('How to book or access this transport'),
});

const AccommodationTypeSchema = z.object({
  category: z.string().describe('Type of accommodation (Luxury, Mid-range, Budget, Hostel, etc.)'),
  averageCostPerNight: z.number().describe('Average cost per night in INR'),
  popularAreas: z.array(z.string()).describe('Best areas to stay for this category'),
  amenities: z.array(z.string()).describe('Common amenities available'),
  safetyScore: z.number().min(0).max(100).describe('Safety score for this category'),
});

const LocalCostSchema = z.object({
  meals: z.object({
    budget: z.number().describe('Budget meal cost per day in INR'),
    midRange: z.number().describe('Mid-range meal cost per day in INR'),
    luxury: z.number().describe('Luxury meal cost per day in INR'),
  }),
  activities: z.object({
    free: z.array(z.string()).describe('Free activities available'),
    budgetRange: z.object({
      min: z.number().describe('Minimum activity cost in INR'),
      max: z.number().describe('Maximum activity cost in INR'),
    }),
  }),
  shopping: z.object({
    markets: z.array(z.string()).describe('Popular local markets'),
    souvenirs: z.object({
      min: z.number().describe('Minimum souvenir cost in INR'),
      max: z.number().describe('Maximum souvenir cost in INR'),
    }),
  }),
});

const DestinationIntelligenceOutputSchema = z.object({
  destination: z.string().describe('Confirmed destination name'),
  country: z.string().describe('Country name'),
  region: z.string().describe('Region or state'),
  climate: z.object({
    season: z.string().describe('Current season during travel dates'),
    temperature: z.string().describe('Expected temperature range'),
    rainfall: z.string().describe('Rainfall expectations'),
    clothing: z.array(z.string()).describe('Recommended clothing'),
  }),
  currency: z.object({
    local: z.string().describe('Local currency'),
    exchangeRate: z.number().describe('Approximate exchange rate to INR'),
  }),
  language: z.object({
    primary: z.string().describe('Primary language'),
    englishLevel: z.string().describe('English proficiency level (High/Medium/Low)'),
    keyPhrases: z.array(z.string()).describe('Useful local phrases'),
  }),
  transportation: z.array(LocalTransportSchema).describe('Available transportation options'),
  accommodation: z.array(AccommodationTypeSchema).describe('Accommodation categories available'),
  costs: LocalCostSchema.describe('Local cost breakdown'),
  safety: z.object({
    overallScore: z.number().min(0).max(100).describe('Overall safety score'),
    concerns: z.array(z.string()).describe('Safety concerns to be aware of'),
    tips: z.array(z.string()).describe('Safety tips for travelers'),
  }),
  culture: z.object({
    customs: z.array(z.string()).describe('Important cultural customs'),
    etiquette: z.array(z.string()).describe('Social etiquette tips'),
    festivals: z.array(z.string()).describe('Local festivals during travel period'),
  }),
  logistics: z.object({
    visa: z.string().describe('Visa requirements for Indian travelers'),
    timeZone: z.string().describe('Time zone difference from IST'),
    electricity: z.string().describe('Plug type and voltage'),
    internet: z.string().describe('Internet availability and quality'),
  }),
});

export type DestinationIntelligenceOutput = z.infer<typeof DestinationIntelligenceOutputSchema>;

const destinationIntelligencePrompt = ai.definePrompt({
  name: 'destinationIntelligencePrompt',
  input: { schema: DestinationIntelligenceInputSchema },
  output: { schema: DestinationIntelligenceOutputSchema },
  prompt: `You are a destination intelligence expert with comprehensive knowledge of global travel destinations. Analyze the following destination and provide detailed, accurate, and current information.

Destination: {{{destination}}}
Duration: {{{duration_days}}} days
Budget: ₹{{{budget_range_inr}}}
Travel Dates: {{{travel_dates}}}
Travelers: {{{people_count}}} people

CRITICAL REQUIREMENTS:
1. **Accuracy**: All information must be factually correct and current
2. **Local Context**: Include destination-specific transportation, costs, and cultural nuances
3. **Practical Details**: Focus on actionable information for travelers
4. **Cost Conversion**: Convert all local costs to INR using current exchange rates
5. **Safety Assessment**: Provide realistic safety scores based on current conditions
6. **Cultural Sensitivity**: Include important cultural customs and etiquette

TRANSPORTATION ANALYSIS:
- Research ALL available local transportation options (not just standard categories)
- Include unique local transport (e.g., tuk-tuks in Thailand, gondolas in Venice, etc.)
- Provide realistic cost ranges in INR
- Consider the specific destination's infrastructure

ACCOMMODATION ANALYSIS:
- Analyze accommodation types available in this specific destination
- Provide realistic pricing in INR for the travel dates
- Consider seasonal pricing variations
- Include unique local accommodation options (ryokans, riads, etc.)

COST ANALYSIS:
- Research current local prices and convert to INR
- Consider the destination's cost of living
- Factor in tourist vs. local pricing
- Include seasonal price variations

Provide comprehensive, destination-specific intelligence that will enable other agents to create realistic and actionable travel plans.`,
});

const destinationIntelligenceFlow = ai.defineFlow(
  {
    name: 'destinationIntelligenceFlow',
    inputSchema: DestinationIntelligenceInputSchema,
    outputSchema: DestinationIntelligenceOutputSchema,
  },
  async (input) => {
    const { output } = await destinationIntelligencePrompt(input);
    if (!output) {
      throw new Error('Failed to gather destination intelligence');
    }
    return output;
  }
);

export async function gatherDestinationIntelligence(
  input: DestinationIntelligenceInput
): Promise<DestinationIntelligenceOutput> {
  console.log('Gathering destination intelligence for:', input.destination);
  
  try {
    const result = await destinationIntelligenceFlow(input);
    return result;
  } catch (error) {
    console.error('Error gathering destination intelligence:', error);
    throw new Error(`Failed to analyze destination: ${input.destination}`);
  }
}