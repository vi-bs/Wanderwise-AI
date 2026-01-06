
'use client';

import { useState } from 'react';
import { InputForm } from '@/components/views/input-form';
import type { GeneratePersonalizedItinerariesInput } from '@/ai/flows/generate-personalized-itineraries';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: GeneratePersonalizedItinerariesInput) => {
    setIsGenerating(true);
    try {
      // In a real app, you would navigate to a loading/results page.
      // For this demo, we'll just simulate a delay.
      console.log('Submitted data:', data);
      await new Promise(resolve => setTimeout(resolve, 4000));
      toast({
        title: "Trip Planned!",
        description: "Your adventure awaits. (Navigation to results page not implemented)",
      });
    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      toast({
        variant: "destructive",
        title: "Something felt off",
        description: "The genie had some trouble. Please try again.",
      });
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="max-w-2xl mx-auto text-center">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl sm:text-6xl md:text-7xl font-headline font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
            >
                Where are we going?
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 text-lg md:text-xl text-muted-foreground"
            >
                Tell us a few things. We’ll plan everything.
            </motion.p>
        </div>

        <div className="mt-12 sm:mt-16">
            <InputForm onSubmit={handleFormSubmit} isGenerating={isGenerating} />
        </div>
    </main>
  );
}
