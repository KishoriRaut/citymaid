import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground">
          Siscora
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
          Building Smart Software Solutions
        </p>
        <div className="pt-4">
          <Button size="lg" className="text-lg px-8 py-6">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
