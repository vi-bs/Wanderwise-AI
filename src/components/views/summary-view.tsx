import type { TripData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Download, Plane, Hotel, Utensils, MapPin, Repeat, ShieldCheck } from "lucide-react";
import Image from "next/image";
import placeholderImagesData from "@/lib/placeholder-images.json";
import Link from "next/link";
import { useState, useEffect } from "react";

interface SummaryViewProps {
    tripData: TripData | null;
    onPlanAnother: () => void;
}

export function SummaryView({ tripData, onPlanAnother }: SummaryViewProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const safetyScore = 85; // Mock data
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            setAnimatedScore(safetyScore);
        }, 300);
        return () => clearTimeout(timeout);
    }, [safetyScore]);

    if (!tripData || !tripData.selectedItinerary) {
        return (
            <div className="text-center p-8 border-2 border-dashed rounded-2xl bg-card/80">
                <h2 className="text-2xl font-headline">Something went wrong</h2>
                <p className="text-muted-foreground">We couldn't load your trip summary.</p>
                <Button onClick={onPlanAnother} className="mt-4 bg-gradient-to-r from-primary-start to-primary-end text-primary-foreground">Start Over</Button>
            </div>
        )
    }

    const { input, selectedItinerary } = tripData;
    const { placeholderImages } = placeholderImagesData;

    return (
        <div>
            <div className="relative rounded-2xl overflow-hidden mb-8 h-64 w-full">
                <Image src={placeholderImages[0].imageUrl} alt={input.destination} fill className="object-cover" data-ai-hint={placeholderImages[0].imageHint}/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 text-white">
                    <h1 className="text-5xl font-headline">{input.destination}</h1>
                    <p className="text-xl text-white/80">{selectedItinerary.title}</p>
                </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card className="rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium font-body">Safety Score</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                           <p className="text-4xl font-bold">{safetyScore}</p>
                           <span className="text-muted-foreground">/ 100</span>
                        </div>
                        <Progress value={animatedScore} className="mt-2 h-2 transition-all duration-1000 ease-out" />
                        <p className="text-xs text-muted-foreground mt-2">Based on local data and recent reviews.</p>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-headline">Cost Breakdown</CardTitle>
                        <CardDescription>Estimated total for {input.people_count} people.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div className="flex items-center gap-2"><Plane className="w-4 h-4 text-muted-foreground"/> Flights: <span className="font-semibold ml-auto">{selectedItinerary.cost.flights}</span></div>
                        <div className="flex items-center gap-2"><Hotel className="w-4 h-4 text-muted-foreground"/> Stays: <span className="font-semibold ml-auto">{selectedItinerary.cost.accommodation}</span></div>
                        <div className="flex items-center gap-2"><Utensils className="w-4 h-4 text-muted-foreground"/> Food: <span className="font-semibold ml-auto">{selectedItinerary.cost.food}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground"/> Activities: <span className="font-semibold ml-auto">{selectedItinerary.cost.activities}</span></div>
                         <Separator className="col-span-2 my-1" />
                        <div className="flex items-center gap-2 text-base font-bold col-span-2">Total Est.: <span className="ml-auto text-xl">{selectedItinerary.cost.total}</span></div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle className="font-headline">Booking Links</CardTitle>
                    <CardDescription>Search for the best deals using these pre-filled links.</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" asChild><Link href={`https://www.google.com/search?q=flights+to+${input.destination}`} target="_blank">Search Flights</Link></Button>
                    <Button variant="outline" asChild><Link href={`https://www.google.com/search?q=hotels+in+${input.destination}`} target="_blank">Search Stays</Link></Button>
                    <Button variant="outline" asChild><Link href={`https://www.google.com/search?q=things+to+do+in+${input.destination}`} target="_blank">Search Activities</Link></Button>
                </CardContent>
            </Card>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                <Button variant="ghost" onClick={onPlanAnother}>
                    <Repeat className="mr-2 h-4 w-4" />
                    Plan Another Trip
                </Button>
                <Button size="lg" className="bg-gradient-to-r from-primary-start to-primary-end text-primary-foreground shadow-lg hover:opacity-90">
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF
                </Button>
            </div>
        </div>
    );
}
