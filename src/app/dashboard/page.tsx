import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import placeholderImagesData from "@/lib/placeholder-images.json";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { placeholderImages } = placeholderImagesData;
  const pastTrips = [
    { id: 1, name: "Summer in Goa", date: "Jul 2023", image: placeholderImages[0] },
    { id: 2, name: "Mountains of Manali", date: "Dec 2022", image: placeholderImages[1] },
    { id: 3, name: "Exploring Jaipur", date: "Oct 2022", image: placeholderImages[4] },
  ];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-headline">Your Trips</h1>
        <Button asChild className="bg-gradient-to-r from-primary-start to-primary-end text-primary-foreground shadow-sm hover:opacity-90 transition-opacity">
          <Link href="/">Plan a New Trip</Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {pastTrips.map((trip) => (
          <Card key={trip.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image
                  src={trip.image.imageUrl}
                  alt={trip.image.description}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={trip.image.imageHint}
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </CardHeader>
            <CardContent className="p-4 bg-card">
              <CardTitle className="text-xl font-headline mb-1">{trip.name}</CardTitle>
              <CardDescription>{trip.date}</CardDescription>
              <Button variant="link" className="p-0 mt-2">View Itinerary &rarr;</Button>
            </CardContent>
          </Card>
        ))}
         <Card className="flex items-center justify-center border-2 border-dashed bg-muted/30 hover:border-primary/50 hover:bg-muted/50 transition-colors">
            <Button variant="ghost" asChild className="flex flex-col h-full w-full items-center justify-center p-8 rounded-lg">
                <Link href="/">
                    <Plus className="h-10 w-10 text-muted-foreground" />
                    <span className="mt-2 font-headline text-lg">Plan new trip</span>
                </Link>
            </Button>
        </Card>
      </div>
    </div>
  );
}
