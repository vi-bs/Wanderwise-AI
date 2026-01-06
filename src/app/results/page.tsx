
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ArrowLeft, BedDouble, Car, CheckCircle2, ChevronRight, Info, Link as LinkIcon, MapPin, Milestone, Plane, Shield, Star, TramFront, Users, Utensils, Wallet } from 'lucide-react';
import type { TripData, Itinerary, DailyPlan, Activity, Hotel, CommuteOption } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function LoadingState() {
  const [progress, setProgress] = useState(13);
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    const timer2 = setTimeout(() => setProgress(90), 1500);
    return () => { clearTimeout(timer); clearTimeout(timer2); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.14))]">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center">
        <h1 className="text-4xl font-headline mb-4">The genie is working its magic...</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">Our AI agents are crafting personalized itineraries just for you. This might take a moment.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="w-full max-w-md mt-8">
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>Analyzing preferences...</span>
          <span>Finding best routes...</span>
          <span>Finalizing plans...</span>
        </div>
      </motion.div>
    </div>
  );
}

function SafetyScore({ score }: { score: number }) {
  const getColor = () => {
    if (score > 85) return 'text-green-500';
    if (score > 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  return (
    <div className="flex items-center gap-1">
      <Shield className={cn('h-4 w-4', getColor())} />
      <span className={cn('font-semibold', getColor())}>{score}</span>
    </div>
  );
}


export default function ResultsPage() {
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedCommuteId, setSelectedCommuteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const results = localStorage.getItem('tripResults');
    const request = localStorage.getItem('tripRequest');
    if (results && request) {
      const parsedResults = JSON.parse(results);
      const parsedRequest = JSON.parse(request);
      
      let itineraries: Itinerary[] = parsedResults.itineraries || [];
      
      if (itineraries.length > 0) {
        setTripData({ input: parsedRequest, itineraries });
        const initialItinerary = itineraries[0];
        setActiveItinerary(initialItinerary);
        // Pre-select the first hotel and commute option
        if (initialItinerary.hotelOptions.length > 0) {
          setSelectedHotelId(initialItinerary.hotelOptions[0].id);
        }
        if (initialItinerary.commuteOptions.length > 0) {
          setSelectedCommuteId(initialItinerary.commuteOptions[0].id);
        }
      } else {
        // Handle case where no itineraries are returned
        router.push('/');
      }
    } else {
      // router.push('/'); // Redirect if no data
    }
  }, [router]);

  const handleActivitySelection = (dayIndex: number, activityId: string, isSelected: boolean) => {
    if (!activeItinerary) return;
    const updatedItinerary = { ...activeItinerary };
    const activity = updatedItinerary.dailyPlan[dayIndex].activities.find(a => a.id === activityId);
    if (activity) {
      activity.selected = isSelected;
      setActiveItinerary(updatedItinerary);
    }
  };

  const calculatedCosts = useMemo(() => {
    if (!activeItinerary || !tripData) return null;

    const numNights = parseInt(tripData.input.duration_days.split('-')[0], 10) -1 || 1;

    const accommodationCost = activeItinerary.hotelOptions.find(h => h.id === selectedHotelId)?.costPerNight || 0;
    const totalAccommodationCost = accommodationCost * numNights;
    
    const activitiesCost = activeItinerary.dailyPlan.flatMap(d => d.activities).reduce((acc, activity) => activity.selected ? acc + activity.cost : acc, 0);

    const commuteCost = activeItinerary.commuteOptions.find(c => c.id === selectedCommuteId)?.cost || 0;
    const totalCommuteCost = commuteCost * (parseInt(tripData.input.duration_days.split('-')[0], 10) || 1);

    const foodCost = activeItinerary.cost.food * (parseInt(tripData.input.duration_days.split('-')[0], 10) || 1);

    const totalSpent = activeItinerary.cost.flights + totalAccommodationCost + activitiesCost + totalCommuteCost + foodCost;

    const remainingBudget = parseInt(tripData.input.budget_range_inr) - totalSpent;
    
    const selectedActivities = activeItinerary.dailyPlan.flatMap(d => d.activities).filter(a => a.selected);
    const selectedHotel = activeItinerary.hotelOptions.find(h => h.id === selectedHotelId);
    const safetyScores = [...selectedActivities.map(a => a.safetyScore), selectedHotel ? selectedHotel.safetyScore : 0].filter(s => s > 0);
    const overallSafetyScore = safetyScores.length > 0 ? Math.round(safetyScores.reduce((a, b) => a + b, 0) / safetyScores.length) : 0;


    return {
      totalAccommodationCost,
      activitiesCost,
      totalCommuteCost,
      totalSpent,
      remainingBudget,
      overallSafetyScore
    };
  }, [activeItinerary, selectedHotelId, selectedCommuteId, tripData]);

  if (!tripData || !activeItinerary || !calculatedCosts) {
    return <LoadingState />;
  }
  
  const selectedHotel = activeItinerary.hotelOptions.find(h => h.id === selectedHotelId);
  const selectedCommute = activeItinerary.commuteOptions.find(c => c.id === selectedCommuteId);

  return (
    <div className="bg-muted/20 min-h-screen">
      <div className="container mx-auto py-8">
        <header className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/')} className="mb-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to planning
          </Button>
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-headline text-foreground">Your Trip to {tripData.input.destination}</h1>
              <p className="text-muted-foreground text-lg">{tripData.input.duration_days}, {tripData.input.people_count} people, on a ₹{parseInt(tripData.input.budget_range_inr).toLocaleString('en-IN')} budget.</p>
            </div>
             <Card className="p-4 bg-background">
              <div className="flex items-center justify-between gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-primary">₹{calculatedCosts.totalSpent.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Remaining Budget</p>
                  <p className="text-2xl font-bold">{calculatedCosts.remainingBudget.toLocaleString('en-IN')}</p>
                </div>
                 <div className="text-center">
                  <p className="text-sm text-muted-foreground">Overall Safety</p>
                  <div className="text-2xl font-bold flex items-center justify-center gap-2">
                    <SafetyScore score={calculatedCosts.overallSafetyScore} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </header>

        <main className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Itinerary */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{activeItinerary.vibe}: {activeItinerary.title}</CardTitle>
                <CardDescription>{activeItinerary.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible defaultValue="day-1" className="w-full">
                  {activeItinerary.dailyPlan.map((day, dayIndex) => (
                    <AccordionItem value={`day-${day.day}`} key={day.day}>
                      <AccordionTrigger className="text-xl font-headline hover:no-underline">Day {day.day}: {day.title}</AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-4">
                          {day.activities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                              <Checkbox
                                id={`activity-${activity.id}`}
                                checked={activity.selected}
                                onCheckedChange={(checked) => handleActivitySelection(dayIndex, activity.id, !!checked)}
                                className="mt-1"
                              />
                              <div className="flex-grow">
                                <Label htmlFor={`activity-${activity.id}`} className="font-semibold text-base cursor-pointer">{activity.name}</Label>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <span>Duration: {activity.duration}</span>
                                  <span>Cost: ₹{activity.cost.toLocaleString('en-IN')}</span>
                                  <a href={activity.infoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                                    <LinkIcon className="h-3 w-3" /> More Info
                                  </a>
                                </div>
                              </div>
                              <SafetyScore score={activity.safetyScore} />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.2}}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Milestone /> Summary & Booking</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedHotel && (
                             <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                                <p className="font-semibold flex items-center gap-2"><BedDouble className="text-primary"/> Selected Stay: {selectedHotel.name}</p>
                                <Button size="sm" asChild variant="ghost">
                                    <a href={selectedHotel.bookingLink} target="_blank" rel="noopener noreferrer">Book Now <ChevronRight className="h-4 w-4 ml-1" /></a>
                                </Button>
                            </div>
                        )}
                       {selectedCommute && (
                             <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                                <p className="font-semibold flex items-center gap-2"><Car className="text-primary"/> Selected Commute: {selectedCommute.type}</p>
                                <Button size="sm" asChild variant="ghost">
                                    <a href={selectedCommute.infoLink} target="_blank" rel="noopener noreferrer">Details <ChevronRight className="h-4 w-4 ml-1" /></a>
                                </Button>
                            </div>
                        )}
                        <h3 className="font-headline text-lg pt-2">Selected Activities:</h3>
                        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                            {activeItinerary.dailyPlan.flatMap(d => d.activities).filter(a => a.selected).map(a => (
                                <li key={a.id}>{a.name}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </motion.div>

          </div>

          {/* Right Column: Options & Costs */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BedDouble /> Hotel Stays</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedHotelId || ''} onValueChange={setSelectedHotelId}>
                    {activeItinerary.hotelOptions.map((hotel) => (
                      <Label key={hotel.id} htmlFor={`hotel-${hotel.id}`} className={cn("block p-4 rounded-lg border-2 cursor-pointer transition-all", selectedHotelId === hotel.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center">
                            <RadioGroupItem value={hotel.id} id={`hotel-${hotel.id}`} className="mr-4"/>
                            <div>
                                <p className="font-semibold">{hotel.name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400"/> {hotel.rating}</span>
                                    <span>₹{hotel.costPerNight.toLocaleString('en-IN')}/night</span>
                                </div>
                            </div>
                           </div>
                           <SafetyScore score={hotel.safetyScore} />
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.1}}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Car /> Commute Options</CardTitle>
                  <CardDescription>Estimated daily cost</CardDescription>
                </CardHeader>
                <CardContent>
                   <RadioGroup value={selectedCommuteId || ''} onValueChange={setSelectedCommuteId}>
                    {activeItinerary.commuteOptions.map((option) => (
                      <Label key={option.id} htmlFor={`commute-${option.id}`} className={cn("block p-3 rounded-lg border-2 cursor-pointer transition-all", selectedCommuteId === option.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                        <div className="flex items-center">
                            <RadioGroupItem value={option.id} id={`commute-${option.id}`} className="mr-4"/>
                             <div className="flex items-center justify-between w-full">
                                <p className="font-semibold flex items-center gap-2">
                                    {option.type === 'Metro' ? <TramFront/> : option.type === 'Taxi' ? <Car /> : <Users />}
                                    {option.type}
                                </p>
                                <span className="font-semibold">₹{option.cost.toLocaleString('en-IN')}/day</span>
                             </div>
                        </div>
                      </Label>
                    ))}
                   </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.2}}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Wallet /> Money Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-base">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Plane />Flights</span>
                        <span className="font-medium">₹{activeItinerary.cost.flights.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><BedDouble />Accommodation</span>
                        <span className="font-medium">₹{calculatedCosts.totalAccommodationCost.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Utensils />Food (Est.)</span>
                        <span className="font-medium">₹{(activeItinerary.cost.food * (parseInt(tripData.input.duration_days.split('-')[0]) || 1)).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><MapPin />Activities</span>
                        <span className="font-medium">₹{calculatedCosts.activitiesCost.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Car />Commute</span>
                        <span className="font-medium">₹{calculatedCosts.totalCommuteCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t my-2"></div>
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total Spent</span>
                        <span>₹{calculatedCosts.totalSpent.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">₹{parseInt(tripData.input.budget_range_inr).toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between items-center text-lg">
                        <span className="font-bold">Remaining</span>
                        <span className={cn('font-bold', calculatedCosts.remainingBudget < 0 ? 'text-destructive' : 'text-green-600')}>₹{calculatedCosts.remainingBudget.toLocaleString('en-IN')}</span>
                    </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
