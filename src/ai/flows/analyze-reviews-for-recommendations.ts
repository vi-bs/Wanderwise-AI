'use server';
/**
 * @fileOverview A flow that analyzes reviews for Hotels, Airlines, Attractions and Cabs.
 *
 * - analyzeReviewsForRecommendations - A function that handles the review analysis process.
 * - AnalyzeReviewsForRecommendationsInput - The input type for the analyzeReviewsForRecommendations function.
 * - AnalyzeReviewsForRecommendationsOutput - The return type for the analyzeReviewsForRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeReviewsForRecommendationsInputSchema = z.object({
  hotels: z.array(z.string()).describe('A list of hotel names to analyze reviews for.'),
  airlines: z.array(z.string()).describe('A list of airline names to analyze reviews for.'),
  attractions: z.array(z.string()).describe('A list of attraction names to analyze reviews for.'),
  cabs: z.array(z.string()).describe('A list of cab service names to analyze reviews for.'),
});

export type AnalyzeReviewsForRecommendationsInput = z.infer<typeof AnalyzeReviewsForRecommendationsInputSchema>;

const ReviewAnalysisSchema = z.object({
  name: z.string().describe('The name of the entity being reviewed (e.g., hotel name, airline name).'),
  pros: z.array(z.string()).describe('A list of positive aspects from the reviews.'),
  cons: z.array(z.string()).describe('A list of negative aspects from the reviews.'),
  sentiment: z.string().describe('The overall sentiment of the reviews (e.g., positive, negative, neutral).'),
  avgRating: z.number().describe('The average rating from the reviews (e.g., 4.5 out of 5).'),
  safetyIndicators: z.array(z.string()).describe('A list of safety indicators or concerns mentioned in the reviews.'),
});

export type ReviewAnalysis = z.infer<typeof ReviewAnalysisSchema>;

const AnalyzeReviewsForRecommendationsOutputSchema = z.object({
  hotelReviews: z.array(ReviewAnalysisSchema).describe('Analyzed reviews for hotels.'),
  airlineReviews: z.array(ReviewAnalysisSchema).describe('Analyzed reviews for airlines.'),
  attractionReviews: z.array(ReviewAnalysisSchema).describe('Analyzed reviews for attractions.'),
  cabReviews: z.array(ReviewAnalysisSchema).describe('Analyzed reviews for cab services.'),
});

export type AnalyzeReviewsForRecommendationsOutput = z.infer<typeof AnalyzeReviewsForRecommendationsOutputSchema>;

export async function analyzeReviewsForRecommendations(input: AnalyzeReviewsForRecommendationsInput): Promise<AnalyzeReviewsForRecommendationsOutput> {
  return analyzeReviewsForRecommendationsFlow(input);
}

const reviewAnalyzerPrompt = ai.definePrompt({
  name: 'reviewAnalyzerPrompt',
  input: {schema: z.object({names: z.array(z.string()), type: z.string()})},
  output: {schema: z.array(ReviewAnalysisSchema)},
  prompt: `You are an expert review analyzer. Analyze reviews for the following {{type}}:

{% each names %}
- {{this}}
{% endeach %}

For each {{type}}, provide:
- name: The name of the {{type}}.
- pros: A list of positive aspects from the reviews.
- cons: A list of negative aspects from the reviews.
- sentiment: The overall sentiment of the reviews (e.g., positive, negative, neutral).
- avgRating: The average rating from the reviews (e.g., 4.5 out of 5).
- safetyIndicators: A list of safety indicators or concerns mentioned in the reviews.`,
});

const analyzeReviewsForRecommendationsFlow = ai.defineFlow(
  {
    name: 'analyzeReviewsForRecommendationsFlow',
    inputSchema: AnalyzeReviewsForRecommendationsInputSchema,
    outputSchema: AnalyzeReviewsForRecommendationsOutputSchema,
  },
  async input => {
    const hotelReviewsPromise = reviewAnalyzerPrompt({
      names: input.hotels,
      type: 'hotel',
    });
    const airlineReviewsPromise = reviewAnalyzerPrompt({
      names: input.airlines,
      type: 'airline',
    });
    const attractionReviewsPromise = reviewAnalyzerPrompt({
      names: input.attractions,
      type: 'attraction',
    });
    const cabReviewsPromise = reviewAnalyzerPrompt({
      names: input.cabs,
      type: 'cab',
    });

    const [hotelReviews, airlineReviews, attractionReviews, cabReviews] = await Promise.all([
      hotelReviewsPromise,
      airlineReviewsPromise,
      attractionReviewsPromise,
      cabReviewsPromise,
    ]);

    return {
      hotelReviews: hotelReviews!.output ?? [],
      airlineReviews: airlineReviews!.output ?? [],
      attractionReviews: attractionReviews!.output ?? [],
      cabReviews: cabReviews!.output ?? [],
    };
  }
);
