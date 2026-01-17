import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 sm:space-y-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
          Siscora
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl px-4">
          Building Smart Software Solutions
        </p>
        <div className="pt-2 sm:pt-4">
          <Link href="/signup">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 min-h-[48px] sm:min-h-0 w-full sm:w-auto max-w-xs">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
