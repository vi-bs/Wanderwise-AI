import { WandSparkles } from "lucide-react";

export function IntroView() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-2xl bg-card/80">
      <div className="p-4 rounded-full bg-gradient-to-br from-primary-start/20 to-primary-end/20 mb-6">
        <WandSparkles className="h-12 w-12 bg-clip-text text-transparent bg-gradient-to-br from-primary-start to-primary-end" />
      </div>
      <h2 className="text-3xl font-headline mb-2">Your journey starts here</h2>
      <p className="max-w-md text-muted-foreground">Fill in your travel details, and let our AI craft the perfect itinerary for you. Your personalized adventure is just a few clicks away.</p>
    </div>
  );
}
