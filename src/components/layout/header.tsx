import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WandSparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <WandSparkles className="h-6 w-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-start to-primary-end" />
          <span className="font-bold font-headline text-lg">Travel Genie</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
        </nav>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button className="bg-gradient-to-r from-primary-start to-primary-end text-primary-foreground shadow-sm hover:opacity-90 transition-opacity" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
