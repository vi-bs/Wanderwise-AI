import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Star, Plane, Hotel, ArrowRight } from "lucide-react";
import Image from 'next/image';
import placeholderImagesData from "@/lib/placeholder-images.json";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CustomizeViewProps {
  onComplete: () => void;
}

const { placeholderImages } = placeholderImagesData;

const mockFlights = [
    { id: 1, airline: 'IndiGo', price: '₹7,500', duration: '2h 30m', stops: 'Non-stop', rating: 4.5, image: placeholderImages[7] },
    { id: 2, airline: 'Vistara', price: '₹9,200', duration: '2h 45m', stops: 'Non-stop', rating: 4.8, image: placeholderImages[7] },
    { id: 3, airline: 'Air India', price: '₹8,100', duration: '2h 35m', stops: 'Non-stop', rating: 4.2, image: placeholderImages[7] },
];

const mockStays = [
    { id: 1, name: 'Seaside Resort & Spa', price: '₹5,000/night', type: 'Luxury Hotel', rating: 4.7, image: placeholderImages[6] },
    { id: 2, name: 'The Goa Hideout', price: '₹2,500/night', type: 'Boutique Guesthouse', rating: 4.9, image: placeholderImages[0] },
    { id: 3, name: 'Palm Grove Villas', price: '₹3,800/night', type: 'Private Villa', rating: 4.6, image: placeholderImages[2] },
];

function Rating({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn('h-4 w-4', i < Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30')} />
            ))}
            <span className="ml-1 text-sm font-medium text-muted-foreground">({value})</span>
        </div>
    )
}

export function CustomizeView({ onComplete }: CustomizeViewProps) {
  const [selectedFlight, setSelectedFlight] = useState<number | null>(2);
  const [selectedStay, setSelectedStay] = useState<number | null>(1);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-headline">Customize your trip</h2>
        <p className="text-muted-foreground mt-1">Fine-tune your flights and stays. The genie found these great options.</p>
      </div>
      <Tabs defaultValue="flights" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flights"><Plane className="mr-2" /> Flights</TabsTrigger>
          <TabsTrigger value="stays"><Hotel className="mr-2" /> Stays</TabsTrigger>
        </TabsList>
        <TabsContent value="flights">
            <div className="space-y-4 mt-4">
                {mockFlights.map(flight => (
                    <Card key={flight.id} onClick={() => setSelectedFlight(flight.id)} className={cn("p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer transition-all duration-300 rounded-xl", selectedFlight === flight.id ? 'border-primary shadow-lg' : 'hover:border-primary/50')}>
                        <Image src={flight.image.imageUrl} alt={flight.airline} width={64} height={64} className="rounded-md" data-ai-hint={flight.image.imageHint}/>
                        <div className="flex-1">
                            <h3 className="font-bold font-body">{flight.airline}</h3>
                            <Rating value={flight.rating} />
                        </div>
                        <div className="text-sm text-muted-foreground text-left sm:text-right">
                            <p>{flight.duration}</p>
                            <p>{flight.stops}</p>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                            <p className="text-lg font-bold">{flight.price}</p>
                        </div>
                        {selectedFlight === flight.id && <Check className="absolute top-3 right-3 h-5 w-5 text-primary" />}
                    </Card>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="stays">
             <div className="space-y-4 mt-4">
                {mockStays.map(stay => (
                    <Card key={stay.id} onClick={() => setSelectedStay(stay.id)} className={cn("p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer transition-all duration-300 rounded-xl", selectedStay === stay.id ? 'border-primary shadow-lg' : 'hover:border-primary/50')}>
                        <Image src={stay.image.imageUrl} alt={stay.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={stay.image.imageHint} />
                        <div className="flex-1">
                            <h3 className="font-bold font-body">{stay.name}</h3>
                            <p className="text-sm text-muted-foreground">{stay.type}</p>
                            <Rating value={stay.rating} />
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                            <p className="text-lg font-bold">{stay.price}</p>
                        </div>
                        {selectedStay === stay.id && <Check className="absolute top-3 right-3 h-5 w-5 text-primary" />}
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
      <div className="mt-8 text-right">
        <Button onClick={onComplete} size="lg" className="bg-gradient-to-r from-primary-start to-primary-end text-primary-foreground shadow-lg hover:opacity-90">
            Finalize Trip <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
