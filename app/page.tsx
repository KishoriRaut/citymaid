import { Button } from "@/components/ui/button";
import Link from "next/link";
import { appConfig } from "@/lib/config";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 sm:space-y-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
          {appConfig.brand.name}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl px-4">
          {appConfig.brand.tagline}
        </p>
      </div>
    </div>
  );
}
