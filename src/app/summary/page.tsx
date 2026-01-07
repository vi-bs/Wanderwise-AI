
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowLeft, BedDouble, Car, CheckCircle, Plane, Utensils, MapPin, Wallet, Shield, Star, Link as LinkIcon } from 'lucide-react';
import type { GeneratePersonalizedItinerariesInput } from '@/ai/flows/generate-personalized-itineraries';
import type { Itinerary, Hotel, CommuteOption, Activity } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

interface FinalTripSummary {
    request: GeneratePersonalizedItinerariesInput;
    itinerary: Itinerary;
    selectedHotel: Hotel;
    selectedCommute: CommuteOption;
    selectedActivities: Activity[];
    costs: {
        totalAccommodationCost: number;
        activitiesCost: number;
        totalCommuteCost: number;
        totalSpent: number;
        remainingBudget: number;
        overallSafetyScore: number;
    };
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-muted-foreground">Loading your trip summary...</p>
    </div>
  );
}

function SafetyScore({ score }: { score: number }) {
  const getColor = () => {
    if (score > 85) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (score > 60) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };
  return (
    <Badge variant="outline" className={cn('gap-1.5 pl-2 pr-2.5 py-1 text-sm', getColor())}>
      <Shield className="h-4 w-4" />
      <span className="font-semibold">{score}</span>
    </Badge>
  );
}

export default function SummaryPage() {
  const [summary, setSummary] = useState<FinalTripSummary | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedSummary = localStorage.getItem('finalTripSummary');
    if (storedSummary) {
      setSummary(JSON.parse(storedSummary));
    } else {
        // Redirect if no summary is found, maybe back to home.
        router.push('/');
    }
  }, [router]);

  if (!summary) {
    return <LoadingState />;
  }

  const { request, itinerary, selectedHotel, selectedCommute, selectedActivities, costs } = summary;
  const heroImage = placeholderImages.placeholderImages.find(img => img.id.includes(request.destination.toLowerCase())) || placeholderImages.placeholderImages[0];


  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="relative h-64 md:h-80 w-full">
        <Image 
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}}>
                <h1 className="text-4xl md:text-6xl font-headline">Your Trip to {request.destination}</h1>
                <p className="mt-2 text-lg md:text-xl font-semibold backdrop-blur-sm p-2 rounded-lg inline-block">{itinerary.vibe}: {itinerary.title}</p>
            </motion.div>
        </div>
        <Button variant="outline" onClick={() => window.close()} className="absolute top-6 left-6 text-foreground bg-background/70 hover:bg-background">
          <ArrowLeft className="mr-2 h-4 w-4" /> Close
        </Button>
      </div>
      
      <main className="container mx-auto py-12 grid md:grid-cols-3 gap-8">
        {/* Left column: Summary */}
        <div className="md:col-span-2 space-y-8">
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.1}}>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-3xl font-headline text-green-600">
                            <CheckCircle className="h-8 w-8" />
                            Booking Confirmed!
                        </CardTitle>
                        <CardDescription className="text-base pt-2">
                            Your personalized itinerary is ready. Here is a summary of your selections for your {request.duration_days} trip.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </motion.div>

            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">Selected Stay & Commute</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2"><BedDouble className="text-primary" /> Hotel</h3>
                            <p className="text-lg font-bold mt-1">{selectedHotel.name}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {selectedHotel.rating}</span>
                                <span>₹{selectedHotel.costPerNight.toLocaleString('en-IN')}/night</span>
                                <SafetyScore score={selectedHotel.safetyScore} />
                            </div>
                            <Button size="sm" asChild className="mt-4">
                                <a href={selectedHotel.bookingLink} target="_blank" rel="noopener noreferrer">View Booking <LinkIcon className="ml-2 h-4 w-4"/></a>
                            </Button>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2"><Car className="text-primary" /> Commute</h3>
                            <p className="text-lg font-bold mt-1">{selectedCommute.type}</p>
                             <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                                <span>₹{selectedCommute.cost.toLocaleString('en-IN')}/day</span>
                                <SafetyScore score={selectedCommute.safetyScore} />
                            </div>
                            <Button size="sm" asChild className="mt-4">
                                <a href={selectedCommute.infoLink} target="_blank" rel="noopener noreferrer">More Info <LinkIcon className="ml-2 h-4 w-4"/></a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.3}}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">Selected Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedActivities.length > 0 ? selectedActivities.map(activity => (
                            <div key={activity.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="font-semibold">{activity.name}</p>
                                    <p className="text-sm text-muted-foreground">{activity.duration}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <SafetyScore score={activity.safetyScore} />
                                    <a href={activity.infoLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        <LinkIcon className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        )) : <p className="text-muted-foreground">No extra activities selected.</p>}
                    </CardContent>
                </Card>
            </motion.div>
        </div>

        {/* Right Column: Costs */}
        <div className="space-y-8 md:sticky md:top-12">
             <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.4}}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-headline"><Wallet /> Final Costs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-base">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Plane />Flights</span>
                        <span className="font-medium">₹{itinerary.cost.flights.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><BedDouble />Accommodation</span>
                        <span className="font-medium">₹{costs.totalAccommodationCost.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Utensils />Food (Est.)</span>
                        <span className="font-medium">₹{(itinerary.cost.food * (parseInt(request.duration_days.split('-')[0]) || 1)).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><MapPin />Activities</span>
                        <span className="font-medium">₹{costs.activitiesCost.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Car />Commute</span>
                        <span className="font-medium">₹{costs.totalCommuteCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t my-2"></div>
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total Spent</span>
                        <span>₹{costs.totalSpent.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Your Budget</span>
                        <span className="font-medium">₹{parseInt(request.budget_range_inr).toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between items-center text-lg">
                        <span className="font-bold">Remaining</span>
                        <span className={cn('font-bold', costs.remainingBudget < 0 ? 'text-destructive' : 'text-green-600')}>₹{costs.remainingBudget.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="border-t my-2"></div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-lg">Overall Safety Score</span>
                        <SafetyScore score={costs.overallSafetyScore} />
                    </div>
                </CardContent>
              </Card>
            </motion.div>
        </div>
      </main>
    </div>
  );
}
