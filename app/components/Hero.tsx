import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center px-6 md:px-16 pt-32 pb-20 overflow-hidden bg-cover bg-center bg-no-repeat min-h-[70vh]"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg')",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80"></div>

      {/* Text content */}
      <div className="relative max-w-xl space-y-6 text-center md:text-left z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
          Track Your <span className="text-accent">Fitness</span>, Achieve Your
          Goals
        </h1>
        <p className="text-lg text-white/80">
          FitTrack helps you monitor workouts, nutrition, and progress all in
          one place.
        </p>

        <div className="flex justify-center md:justify-end mt-6">
          <Button>Get Started</Button>
        </div>
      </div>

      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>
    </section>
  );
}
