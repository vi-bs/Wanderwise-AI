import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ItinerarySkeleton() {
    return (
        <div className="p-6 border rounded-2xl bg-card/80 space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-6 w-2/5" />
                <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        </div>
    )
}

export function LoadingView() {
  return (
    <div className="h-full">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-headline mb-2 animate-pulse">Your trip is taking shape...</h2>
            <p className="text-muted-foreground">Our AI genie is exploring destinations, checking vibes, and crafting unique plans for you.</p>
        </div>
        <div className="relative space-y-6 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 blur-3xl" />
            <ItinerarySkeleton />
            <div className="opacity-60">
                <ItinerarySkeleton />
            </div>
            <div className="opacity-30">
                <ItinerarySkeleton />
            </div>
        </div>
    </div>
  );
}
