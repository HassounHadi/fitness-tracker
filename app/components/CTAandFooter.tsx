"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function CTAAndFooter() {
  const { data: session } = useSession();

  return (
    <>
      {/* === Call to Action Section === */}
      <section className="py-24 px-6 md:px-16 bg-gradient-to-r from-secondary to-primary text-center text-white relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 z-10 relative">
          <h2 className="t2 text-white">
            Ready to Take Your Fitness to the{" "}
            <span className="text-accent">NEXT LEVEL</span>?
          </h2>

          <p className="p1 text-white/80">
            Join FitTrack today and start building healthier habits with smart
            tracking, AI coaching, and progress insights.
          </p>

          {!session && (
            <Link href="/signup">
              <Button size={"lg"}>Get Started</Button>
            </Link>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-10 translate-y-10"></div>
      </section>

      {/* === Footer === */}
      <footer className="py-6 bg-white border-t border-gray-200 text-center">
        <p className="p2 text-gray-500">
          © {new Date().getFullYear()}{" "}
          <span className="text-primary font-semibold">FitTrack</span>. All
          rights reserved.
        </p>
      </footer>
    </>
  );
}
