
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, Edit, MapPin, Plane, Utensils, Wallet } from 'lucide-react';
import type { TripData, Itinerary } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

function LoadingState() {
  const [progress, setProgress] = useState(13)
 
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    const timer2 = setTimeout(() => setProgress(90), 1500)
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.14))]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-headline mb-4">The genie is working its magic...</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">Our AI agents are crafting personalized itineraries just for you. This might take a moment.</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md mt-8"
        >
          <Progress value={progress} className="w-full" />
           <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Analyzing preferences...</span>
            <span>Finding best routes...</span>
            <span>Finalizing plans...</span>
           </div>
        </motion.div>
    </div>
  )
}

export default function ResultsPage() {
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const router = useRouter();

  useEffect(() => {
    const results = localStorage.getItem('tripResults');
    const request = localStorage.getItem('tripRequest');
    if (results && request) {
      const parsedResults = JSON.parse(results);
      const parsedRequest = JSON.parse(request);

      // Assuming the n8n workflow returns an array, let's process it
      // The actual structure from n8n might be nested, e.g., in data[0].json.itineraries
      let itineraries = [];
      if (Array.isArray(parsedResults) && parsedResults.length > 0 && parsedResults[0].json && Array.isArray(parsedResults[0].json.itineraries)) {
        itineraries = parsedResults[0].json.itineraries;
      } else if (Array.isArray(parsedResults.itineraries)) {
        itineraries = parsedResults.itineraries;
      } else if (Array.isArray(parsedResults)) {
         // Fallback for simpler array structure
         itineraries = parsedResults;
      }

      if (itineraries.length > 0) {
        const fullTripData: TripData = {
            input: parsedRequest,
            itineraries: itineraries,
            selectedItinerary: itineraries[0],
          };
          setTripData(fullTripData);
          setSelectedItinerary(itineraries[0]);
      }
    }
  }, []);

  const handleSelectItinerary = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary);
  };

  const handleEditRequest = () => {
    router.push('/');
  }

  if (!tripData || !selectedItinerary) {
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-8 p-4 bg-muted/30 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-headline">Your Trip to {tripData.input.destination}</h1>
                <p className="text-muted-foreground">{tripData.input.duration_days} for {tripData.input.people_count} people.</p>
            </div>
            <Button variant="outline" onClick={handleEditRequest}>
                <Edit className="mr-2 h-4 w-4" /> Edit Request
            </Button>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        <motion.div className="md:col-span-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-headline mb-4">Choose Your Vibe</h2>
            <div className="space-y-4">
            {tripData.itineraries.map((itinerary) => (
                <Card
                key={itinerary.id}
                className={`cursor-pointer transition-all ${selectedItinerary.id === itinerary.id ? 'border-primary ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}
                onClick={() => handleSelectItinerary(itinerary)}
                >
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>{itinerary.vibe}</span>
                        {selectedItinerary.id === itinerary.id && <Check className="h-6 w-6 text-primary" />}
                    </CardTitle>
                    <CardDescription>{itinerary.title}</CardDescription>
                </CardHeader>
                </Card>
            ))}
            </div>
        </motion.div>

        <div className="md:col-span-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedItinerary.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl font-headline">{selectedItinerary.vibe}: {selectedItinerary.title}</CardTitle>
                            <CardDescription className="pt-2">{selectedItinerary.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Tabs defaultValue="itinerary">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="itinerary">Daily Plan</TabsTrigger>
                                <TabsTrigger value="cost">Cost Breakdown</TabsTrigger>
                            </TabsList>
                            <TabsContent value="itinerary" className="mt-4">
                                <Accordion type="single" collapsible defaultValue="day-1">
                                    {selectedItinerary.dailyPlan.map((day) => (
                                    <AccordionItem value={`day-${day.day}`} key={day.day}>
                                        <AccordionTrigger className="text-lg font-semibold">Day {day.day}: {day.title}</AccordionTrigger>
                                        <AccordionContent>
                                        <ul className="space-y-2 pl-4 list-disc">
                                            {day.activities.map((activity, index) => (
                                                <li key={index} className="text-muted-foreground">{activity}</li>
                                            ))}
                                        </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                    ))}
                                </Accordion>
                            </TabsContent>
                            <TabsContent value="cost" className="mt-4">
                                <ul className="space-y-4 text-lg">
                                    <li className="flex items-center justify-between">
                                        <span className="flex items-center"><Plane className="mr-3 text-primary" /> Flights</span>
                                        <span className="font-semibold">{selectedItinerary.cost.flights}</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="flex items-center"><MapPin className="mr-3 text-primary" /> Accommodation</span>
                                        <span className="font-semibold">{selectedItinerary.cost.accommodation}</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="flex items-center"><Utensils className="mr-3 text-primary" /> Food</span>
                                        <span className="font-semibold">{selectedItinerary.cost.food}</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="flex items-center"><Wallet className="mr-3 text-primary" /> Activities</span>
                                        <span className="font-semibold">{selectedItinerary.cost.activities}</span>
                                    </li>
                                    <li className="flex items-center justify-between border-t pt-4 mt-4 font-bold text-xl">
                                        <span>Total Est. Cost</span>
                                        <span>{selectedItinerary.cost.total}</span>
                                    </li>
                                </ul>
                            </TabsContent>
                        </Tabs>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
