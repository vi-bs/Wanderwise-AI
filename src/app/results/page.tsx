
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BedDouble, Car, CheckCircle2, ChevronRight, Info, Link as LinkIcon, MapPin, Milestone, Plane, Shield, Star, TramFront, Users, Utensils, Wallet, Sparkles } from 'lucide-react';
import type { TripData, Itinerary, DailyPlan, Activity, Hotel, CommuteOption } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"


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

function ItineraryVibeSelector({ itineraries, onSelect, activeItineraryId }: { itineraries: Itinerary[], onSelect: (itinerary: Itinerary) => void, activeItineraryId: string | null }) {
    const [api, setApi] = useState<CarouselApi>()
    
    useEffect(() => {
        if(!api) return;
        const activeIndex = itineraries.findIndex(it => it.id === activeItineraryId);
        if(activeIndex !== -1 && api.selectedScrollSnap() !== activeIndex) {
            api.scrollTo(activeIndex);
        }
    }, [api, activeItineraryId, itineraries])

    const handleSelect = (index: number) => {
        api?.scrollTo(index);
        onSelect(itineraries[index]);
    }

    return (
        <Carousel setApi={setApi} className="w-full max-w-4xl mx-auto" opts={{align: 'center', loop: true}}>
            <CarouselContent>
                {itineraries.map((itinerary, index) => (
                    <CarouselItem key={itinerary.id} className="md:basis-1/2 lg:basis-1/3">
                         <Card 
                            onClick={() => handleSelect(index)}
                            className={cn(
                                "cursor-pointer transition-all duration-300 transform",
                                activeItineraryId === itinerary.id 
                                    ? "border-primary shadow-2xl scale-105 bg-card"
                                    : "border-border hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                            )}
                        >
                            <CardHeader>
                                <CardTitle className="text-xl font-headline">{itinerary.vibe}</CardTitle>
                                <CardDescription>{itinerary.title}</CardDescription>
                            </CardHeader>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
        </Carousel>
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
        // Calculate initial costs
        itineraries = itineraries.map(itin => {
            const numNights = parseInt(parsedRequest.duration_days.split('-')[0], 10) -1 || 1;
            const accommodationCost = itin.hotelOptions[0]?.costPerNight * numNights || 0;
            const activitiesCost = itin.dailyPlan.flatMap(d => d.activities).reduce((acc, activity) => activity.selected ? acc + activity.cost : acc, 0);
            const commuteCost = (itin.commuteOptions[0]?.cost || 0) * (parseInt(parsedRequest.duration_days.split('-')[0], 10) || 1);
            const foodCost = (itin.cost.food || 0) * (parseInt(parsedRequest.duration_days.split('-')[0], 10) || 1);
            const total = itin.cost.flights + accommodationCost + activitiesCost + commuteCost + foodCost;
            return {
                ...itin,
                cost: {
                    ...itin.cost,
                    total,
                    accommodation: accommodationCost,
                    activities: activitiesCost,
                    commute: commuteCost,
                    food: foodCost
                }
            }
        });


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
        router.push('/');
      }
    } else {
      // Keep loading screen if no data yet
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
  
  const handleItinerarySelection = (itinerary: Itinerary) => {
    setActiveItinerary(itinerary);
    if (itinerary.hotelOptions.length > 0 && !itinerary.hotelOptions.find(h => h.id === selectedHotelId)) {
      setSelectedHotelId(itinerary.hotelOptions[0].id);
    }
    if (itinerary.commuteOptions.length > 0 && !itinerary.commuteOptions.find(c => c.id === selectedCommuteId)) {
        setSelectedCommuteId(itinerary.commuteOptions[0].id);
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

  const handleFinalizeTrip = () => {
    if (!tripData || !activeItinerary || !calculatedCosts) return;

    const finalTripData = {
        request: tripData.input,
        itinerary: activeItinerary,
        selectedHotel: activeItinerary.hotelOptions.find(h => h.id === selectedHotelId),
        selectedCommute: activeItinerary.commuteOptions.find(c => c.id === selectedCommuteId),
        selectedActivities: activeItinerary.dailyPlan.flatMap(d => d.activities).filter(a => a.selected),
        costs: calculatedCosts,
    };
    localStorage.setItem('finalTripSummary', JSON.stringify(finalTripData));
    window.open('/summary', '_blank');
  };

  if (!tripData || !activeItinerary || !calculatedCosts) {
    return <LoadingState />;
  }
  
  const selectedHotel = activeItinerary.hotelOptions.find(h => h.id === selectedHotelId);
  const selectedCommute = activeItinerary.commuteOptions.find(c => c.id === selectedCommuteId);

  return (
    <div className="bg-muted/20 min-h-screen">
      <div className="container mx-auto py-8">
        <header className="mb-8 text-center">
          <Button variant="ghost" onClick={() => router.push('/')} className="absolute top-6 left-6 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to planning
          </Button>
          <motion.div initial={{opacity:0, y: -20}} animate={{opacity:1, y:0}}>
            <p className="text-lg font-semibold text-primary">Your trip to</p>
            <h1 className="text-5xl font-headline text-foreground">{tripData.input.destination}</h1>
            <p className="text-muted-foreground text-lg mt-1">{tripData.input.duration_days}, {tripData.input.people_count} people, on a ₹{parseInt(tripData.input.budget_range_inr).toLocaleString('en-IN')} budget.</p>
          </motion.div>
        </header>

        <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="my-10">
            <h2 className="text-center text-2xl font-headline mb-4">First, pick a vibe...</h2>
            <ItineraryVibeSelector 
                itineraries={tripData.itineraries} 
                onSelect={handleItinerarySelection}
                activeItineraryId={activeItinerary.id}
            />
        </motion.div>


        <main className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Itinerary */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeItinerary.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary-start/10 to-primary-end/10">
                    <CardTitle className="text-3xl font-headline">{activeItinerary.vibe}: {activeItinerary.title}</CardTitle>
                    <CardDescription className="text-base">{activeItinerary.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible defaultValue="day-1" className="w-full">
                      {activeItinerary.dailyPlan.map((day, dayIndex) => (
                        <AccordionItem value={`day-${day.day}`} key={day.day}>
                          <AccordionTrigger className="text-xl font-headline hover:no-underline px-6 py-4">Day {day.day}: {day.title}</AccordionTrigger>
                          <AccordionContent className="px-6">
                            <div className="space-y-4 border-l-2 border-dashed border-primary/50 ml-2 pl-6 py-4">
                              {day.activities.map((activity) => (
                                <motion.div 
                                    key={activity.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * dayIndex }}
                                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors relative"
                                >
                                  <div className="absolute -left-[35px] top-1/2 -translate-y-1/2 bg-background h-5 w-5 rounded-full border-2 border-primary/50 flex items-center justify-center">
                                      <div className={cn("h-2 w-2 rounded-full", activity.selected ? 'bg-primary' : 'bg-muted')}></div>
                                  </div>
                                  <Checkbox
                                    id={`activity-${activity.id}`}
                                    checked={activity.selected}
                                    onCheckedChange={(checked) => handleActivitySelection(dayIndex, activity.id, !!checked)}
                                    className="mt-1"
                                  />
                                  <div className="flex-grow">
                                    <Label htmlFor={`activity-${activity.id}`} className="font-semibold text-base cursor-pointer">{activity.name}</Label>
                                    {activity.review && (
                                      <p className="text-sm text-muted-foreground italic">"{activity.review.snippet}" <span className="font-bold not-italic">({activity.review.rating} ★)</span></p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                      <span>Duration: {activity.duration}</span>
                                      <span>Cost: ₹{activity.cost.toLocaleString('en-IN')}</span>
                                      <a href={activity.infoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                                        <LinkIcon className="h-3 w-3" /> More Info
                                      </a>
                                    </div>
                                  </div>
                                  <SafetyScore score={activity.safetyScore} />
                                </motion.div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.3}}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Milestone /> Summary & Booking</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedHotel && (
                             <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                                <p className="font-semibold flex items-center gap-2"><BedDouble className="text-primary"/> Selected Stay: {selectedHotel.name}</p>
                                <Button size="sm" asChild>
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
                         <div className="flex justify-end pt-4">
                            <Button 
                                size="lg" 
                                className="bg-gradient-to-r from-primary-start to-primary-end text-primary-foreground shadow-lg hover:shadow-xl"
                                onClick={handleFinalizeTrip}
                            >
                                <Sparkles className="mr-2 h-4 w-4" /> Finalize & Book Trip
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

          </div>

          {/* Right Column: Options & Costs */}
          <div className="space-y-8 lg:sticky lg:top-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.1}}>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.2}}>
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.3}}>
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
                                    {option.type === 'Scooter Rental' ? <Milestone className='rotate-90'/> : option.type.includes('Car') ? <Car /> : <Users />}
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
          </div>
        </main>
      </div>
    </div>
  );
}
