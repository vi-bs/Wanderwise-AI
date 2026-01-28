'use server';

/**
 * @fileOverview Accommodation Booking Agent - Finds and curates accommodation options
 * This agent specializes in finding realistic accommodation options with real booking links
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AccommodationBookingInputSchema = z.object({
  destination: z.string().describe('The travel destination'),
  duration_days: z.number().describe('Duration of the trip in days'),
  budget_range_inr: z.string().describe('Budget range in INR'),
  people_count: z.number().describe('Number of travelers'),
  travel_dates: z.string().describe('Travel dates'),
  preferences: z.array(z.string()).describe('Travel preferences'),
  destinationIntelligence: z.object({
    accommodation: z.array(z.object({
      category: z.string(),
      averageCostPerNight: z.number(),
      popularAreas: z.array(z.string()),
      amenities: z.array(z.string()),
      safetyScore: z.number(),
    })),
    currency: z.object({
      local: z.string(),
      exchangeRate: z.number(),
    }),
  }).describe('Accommodation intelligence from destination agent'),
});

export type AccommodationBookingInput = z.infer<typeof AccommodationBookingInputSchema>;

const AccommodationOptionSchema = z.object({
  id: z.string().describe('Unique accommodation ID'),
  name: z.string().describe('Property name'),
  type: z.string().describe('Type of accommodation (Hotel, Hostel, Apartment, etc.)'),
  category: z.enum(['Luxury', 'Premium', 'Mid-Range', 'Budget', 'Backpacker']).describe('Price category'),
  rating: z.number().min(0).max(5).describe('Star rating or review score'),
  location: z.object({
    area: z.string().describe('Neighborhood or area name'),
    distanceToCenter: z.string().describe('Distance to city center'),
    nearbyAttractions: z.array(z.string()).describe('Nearby attractions or landmarks'),
    transportAccess: z.array(z.string()).describe('Available transportation options'),
  }),
  pricing: z.object({
    costPerNight: z.number().describe('Cost per night in INR'),
    totalCost: z.number().describe('Total cost for the stay in INR'),
    cancellationPolicy: z.string().describe('Cancellation policy summary'),
    paymentOptions: z.array(z.string()).describe('Available payment methods'),
  }),
  amenities: z.array(z.string()).describe('Available amenities'),
  roomDetails: z.object({
    roomType: z.string().describe('Type of room'),
    capacity: z.number().describe('Maximum occupancy'),
    bedConfiguration: z.string().describe('Bed setup'),
    privateOrShared: z.string().describe('Private room or shared space'),
  }),
  bookingInfo: z.object({
    platform: z.string().describe('Booking platform (Booking.com, Agoda, etc.)'),
    bookingLink: z.string().url().describe('Direct booking link'),
    alternativeLinks: z.array(z.string()).describe('Alternative booking platforms'),
    contactInfo: z.string().describe('Direct contact information if available'),
  }),
  reviews: z.object({
    averageRating: z.number().describe('Average review rating'),
    totalReviews: z.number().describe('Total number of reviews'),
    recentReview: z.object({
      source: z.string().describe('Review source'),
      snippet: z.string().describe('Review excerpt'),
      rating: z.number().describe('Individual review rating'),
      date: z.string().describe('Review date'),
    }),
    pros: z.array(z.string()).describe('Common positive points from reviews'),
    cons: z.array(z.string()).describe('Common negative points from reviews'),
  }),
  safetyScore: z.number().min(0).max(100).describe('Safety score based on location and reviews'),
  suitabilityScore: z.number().min(0).max(100).describe('How well it matches traveler preferences'),
  uniqueFeatures: z.array(z.string()).describe('Unique or standout features'),
  localTips: z.array(z.string()).describe('Local tips about the property or area'),
});

const AccommodationBookingOutputSchema = z.object({
  destination: z.string().describe('Destination name'),
  searchCriteria: z.object({
    checkIn: z.string().describe('Check-in date'),
    checkOut: z.string().describe('Check-out date'),
    guests: z.number().describe('Number of guests'),
    budgetRange: z.string().describe('Budget range in INR'),
  }),
  accommodationOptions: z.array(AccommodationOptionSchema).min(3).max(8).describe('3-8 accommodation options'),
  areaRecommendations: z.array(z.object({
    area: z.string().describe('Area name'),
    description: z.string().describe('Area description'),
    bestFor: z.array(z.string()).describe('What this area is best for'),
    averageCost: z.number().describe('Average accommodation cost in this area'),
    safetyScore: z.number().describe('Area safety score'),
  })).describe('Recommended areas to stay'),
  bookingTips: z.array(z.string()).describe('Tips for booking accommodation in this destination'),
  seasonalConsiderations: z.array(z.string()).describe('Seasonal factors affecting accommodation'),
  budgetBreakdown: z.object({
    luxury: z.number().describe('Number of luxury options'),
    premium: z.number().describe('Number of premium options'),
    midRange: z.number().describe('Number of mid-range options'),
    budget: z.number().describe('Number of budget options'),
    backpacker: z.number().describe('Number of backpacker options'),
  }),
});

export type AccommodationBookingOutput = z.infer<typeof AccommodationBookingOutputSchema>;

const accommodationBookingPrompt = ai.definePrompt({
  name: 'accommodationBookingPrompt',
  input: { schema: AccommodationBookingInputSchema },
  output: { schema: AccommodationBookingOutputSchema },
  prompt: `You are an accommodation booking specialist with access to comprehensive property databases worldwide. Find the best accommodation options that match the traveler's needs and budget.

BOOKING REQUEST:
- Destination: {{{destination}}}
- Duration: {{{duration_days}}} nights
- Guests: {{{people_count}}} people
- Budget: ₹{{{budget_range_inr}}}
- Travel Dates: {{{travel_dates}}}
- Preferences: {{#each preferences}}{{{this}}}, {{/each}}

DESTINATION ACCOMMODATION CONTEXT:
{{#each destinationIntelligence.accommodation}}
- {{{category}}}: ₹{{{averageCostPerNight}}}/night, Areas: {{#each popularAreas}}{{{this}}}, {{/each}}
{{/each}}

SEARCH REQUIREMENTS:
1. **Real Properties**: Research actual hotels, hostels, apartments, and unique stays
2. **Accurate Pricing**: Provide realistic costs in INR for the travel dates
3. **Genuine Booking Links**: Use real booking platforms (Booking.com, Agoda, Airbnb, etc.)
4. **Diverse Options**: Include various price points and accommodation types
5. **Location Intelligence**: Consider proximity to attractions and transportation
6. **Review Analysis**: Include genuine review insights and ratings
7. **Practical Details**: Cancellation policies, payment options, amenities

PROPERTY RESEARCH FOCUS:
- Search for properties that actually exist in the destination
- Consider seasonal pricing and availability
- Include unique local accommodation types (ryokans, riads, homestays, etc.)
- Factor in group size for room configurations
- Research neighborhood safety and convenience
- Include both international chains and local properties

BOOKING PLATFORM STRATEGY:
- Provide primary booking links from major platforms
- Include alternative booking options for price comparison
- Consider direct booking advantages where applicable
- Factor in platform reliability and customer service

AREA ANALYSIS:
- Research the best neighborhoods for different traveler types
- Consider safety, convenience, and local character
- Factor in transportation access and walkability
- Include insider knowledge about each area

Find accommodation options that provide excellent value, safety, and experience for these travelers.`,
});

const accommodationBookingFlow = ai.defineFlow(
  {
    name: 'accommodationBookingFlow',
    inputSchema: AccommodationBookingInputSchema,
    outputSchema: AccommodationBookingOutputSchema,
  },
  async (input) => {
    const { output } = await accommodationBookingPrompt(input);
    if (!output) {
      throw new Error('Failed to find accommodation options');
    }
    return output;
  }
);

export async function findAccommodationOptions(
  input: AccommodationBookingInput
): Promise<AccommodationBookingOutput> {
  console.log('Finding accommodation options for:', input.destination);
  
  try {
    const result = await accommodationBookingFlow(input);
    return result;
  } catch (error) {
    console.error('Error finding accommodation options:', error);
    throw new Error(`Failed to find accommodation for: ${input.destination}`);
  }
}