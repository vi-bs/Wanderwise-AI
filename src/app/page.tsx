'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { InputForm } from '@/components/views/input-form';
import { IntroView } from '@/components/views/intro-view';
import { LoadingView } from '@/components/views/loading-view';
import { ItineraryView } from '@/components/views/itinerary-view';
import { CustomizeView } from '@/components/views/customize-view';
import { SummaryView } from '@/components/views/summary-view';
import type { GeneratePersonalizedItinerariesInput } from '@/ai/flows/generate-personalized-itineraries';
import { MotionWrapper } from '@/components/motion-wrapper';
import { generatePersonalizedItineraries } from '@/ai/flows/generate-personalized-itineraries';
import type { Itinerary, TripData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type ViewState = 'intro' | 'loading' | 'itineraries' | 'customize' | 'summary';

export default function HomePage() {
  const [viewState, setViewState] = useState<ViewState>('intro');
  const [tripData, setTripData] = useState<TripData | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (data: GeneratePersonalizedItinerariesInput) => {
    setViewState('loading');
    try {
      // In a real app, you would call your server action here which in turn calls the AI flow.
      // For demonstration, we are calling the flow directly and using mock data if the webhook URL is not set.

      // Using mock data for UI demonstration
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockItineraries: Itinerary[] = [
        {
          id: '1',
          vibe: 'Relaxed',
          title: 'Beach Bliss in Goa',
          description: 'A chill-paced journey focusing on beaches, cafes, and sunsets.',
          dailyPlan: [
            { day: 1, title: 'Arrival & Beach Time', activities: ['Check into hotel', 'Relax at Baga Beach', 'Dinner at a beach shack'] },
            { day: 2, title: 'South Goa Exploration', activities: ['Visit Palolem Beach', 'Explore Old Goa churches', 'Sunset at Agonda Beach'] },
            { day: 3, title: 'Departure', activities: ['Souvenir shopping', 'Brunch at a local cafe', 'Head to airport'] },
          ],
          cost: { total: '₹45,000', flights: '₹15,000', accommodation: '₹20,000', food: '₹5,000', activities: '₹5,000' },
        },
        {
          id: '2',
          vibe: 'Adventurous',
          title: 'Goa Explorer\'s Path',
          description: 'An action-packed trip with water sports, trekking, and local exploration.',
          dailyPlan: [
            { day: 1, title: 'Water Sports', activities: ['Scuba diving at Grand Island', 'Parasailing at Calangute', 'Night market visit'] },
            { day: 2, title: 'Trekking & Spice', activities: ['Trek to Dudhsagar Falls', 'Visit a spice plantation', 'Feni tasting'] },
            { day: 3, title: 'Kayaking & Farewell', activities: ['Kayaking in the backwaters', 'Relax on a quiet beach', 'Departure'] },
          ],
          cost: { total: '₹60,000', flights: '₹15,000', accommodation: '₹25,000', food: '₹8,000', activities: '₹12,000' },
        },
        {
          id: '3',
          vibe: 'Cultural',
          title: 'Goa Heritage Trail',
          description: 'Immerse yourself in the rich history and culture of the region.',
          dailyPlan: [
            { day: 1, title: 'Historic Panjim', activities: ['Walk through Fontainhas', 'Visit Goa State Museum', 'Mandovi River cruise'] },
            { day: 2, title: 'Portuguese Legacy', activities: ['Explore Fort Aguada', 'Visit Basilica of Bom Jesus', 'Traditional Goan meal'] },
            { day: 3, title: 'Art & Craft', activities: ['Visit an art gallery', 'Local craft market shopping', 'Departure'] },
          ],
          cost: { total: '₹50,000', flights: '₹15,000', accommodation: '₹22,000', food: '₹7,000', activities: '₹6,000' },
        },
      ];
      
      setTripData({ input: data, itineraries: mockItineraries, selectedItinerary: null });
      setViewState('itineraries');
    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      toast({
        variant: "destructive",
        title: "Something felt off",
        description: "The genie had some trouble. Please try again.",
      })
      setViewState('intro');
    }
  };

  const handleItinerarySelect = (itinerary: Itinerary) => {
    if (tripData) {
      setTripData({ ...tripData, selectedItinerary: itinerary });
      setViewState('customize');
    }
  };
  
  const handleCustomizationComplete = () => {
    setViewState('summary');
  };
  
  const handlePlanAnotherTrip = () => {
    setTripData(null);
    setViewState('intro');
  };

  const renderContent = () => {
    switch (viewState) {
      case 'intro':
        return <MotionWrapper motionKey="intro"><IntroView /></MotionWrapper>;
      case 'loading':
        return <MotionWrapper motionKey="loading"><LoadingView /></MotionWrapper>;
      case 'itineraries':
        return <MotionWrapper motionKey="itineraries"><ItineraryView itineraries={tripData?.itineraries || []} onSelect={handleItinerarySelect} /></MotionWrapper>;
      case 'customize':
        return <MotionWrapper motionKey="customize"><CustomizeView onComplete={handleCustomizationComplete} /></MotionWrapper>;
      case 'summary':
        return <MotionWrapper motionKey="summary"><SummaryView tripData={tripData} onPlanAnother={handlePlanAnotherTrip} /></MotionWrapper>;
      default:
        return <MotionWrapper motionKey="default"><IntroView /></MotionWrapper>;
    }
  };

  return (
    <div className="container grid lg:grid-cols-12 gap-12 min-h-[calc(100vh-theme(spacing.14))] py-8">
      <aside className="lg:col-span-4">
        <div className="sticky top-20">
          <InputForm onSubmit={handleFormSubmit} isGenerating={viewState === 'loading'} />
        </div>
      </aside>
      <section className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </section>
    </div>
  );
}
