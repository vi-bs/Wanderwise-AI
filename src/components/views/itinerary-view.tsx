import type { Itinerary } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ItineraryViewProps {
  itineraries: Itinerary[];
  onSelect: (itinerary: Itinerary) => void;
}

const vibeEmoji: Record<string, string> = {
    'Relaxed': '😌',
    'Adventurous': '🧗',
    'Cultural': '🏛️',
    'default': '✨'
}

export function ItineraryView({ itineraries, onSelect }: ItineraryViewProps) {
  return (
    <div>
        <div className="mb-8">
            <h2 className="text-4xl font-headline">Here are your custom plans</h2>
            <p className="text-muted-foreground mt-1">The genie has returned with three unique itineraries. Choose the one that fits your vibe.</p>
        </div>
        <div className="grid md:grid-cols-1 gap-6">
        {itineraries.map((itinerary) => (
          <Card key={itinerary.id} className="flex flex-col group hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-2xl font-headline">{itinerary.title}</span>
                <span className="text-3xl">{vibeEmoji[itinerary.vibe] || vibeEmoji.default}</span>
              </CardTitle>
              <CardDescription>{itinerary.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>View Daily Plan</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-4">
                      {itinerary.dailyPlan.map(day => (
                        <li key={day.day} className="text-sm pl-2 border-l-2">
                          <strong className="font-bold ml-3">Day {day.day}: {day.title}</strong>
                          <ul className="list-disc pl-8 mt-1 text-muted-foreground space-y-1">
                            {day.activities.map((activity, i) => <li key={i}>{activity}</li>)}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/30 p-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <p className="text-lg font-bold">{itinerary.cost.total}</p>
              </div>
              <Button onClick={() => onSelect(itinerary)} size="lg" className="bg-gradient-to-r from-primary-start to-primary-end text-primary-foreground shadow-lg hover:opacity-90">
                <Check className="mr-2 h-5 w-5" />
                Select & Customize
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
