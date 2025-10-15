"use client";
import Lottie from "lottie-react";
import exerciseAnimation from "@/public/exercise.json";
import aiWorkout from "@/public/ai-workout.json";
import aiCoach from "@/public/ai-coach.json";
import calendar from "@/public/calendar.json";
import analytics from "@/public/analytics.json";
import nutrition from "@/public/nutrition.json";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Exercise Library & Discover",
    description:
      "Browse a huge collection of exercises and find new workouts tailored for you.",
    lottie: exerciseAnimation,
  },
  {
    title: "AI Workout Generator",
    description:
      "Get personalized AI-generated workouts based on your fitness goals.",
    lottie: aiWorkout,
  },
  {
    title: "Workout Calendar & Scheduling",
    description: "Plan your week, schedule sessions, and never miss a workout.",
    lottie: calendar,
  },
  {
    title: "Progress Tracking & Analytics",
    description: "Monitor your performance with detailed analytics and stats.",
    lottie: analytics,
  },
  {
    title: "AI Progress Analyzer & Coach",
    description:
      "Receive insights and coaching suggestions from our AI assistant.",
    lottie: aiCoach,
  },
  {
    title: "Nutrition Quick Logger",
    description: "Log your meals quickly and track macros effortlessly.",
    lottie: nutrition,
  },
];

export default function KeyFeatures() {
  return (
    <section className="py-20 px-6 md:px-16 bg-white">
      <div className="grid grid-cols-1 gap-8 md:gap-16">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={cn("flex flex-col items-center gap-10", {
              "md:flex-row-reverse": idx % 2 !== 0,
              "md:flex-row": idx % 2 === 0,
            })}
          >
            {/* Lottie animation */}
            <div className="w-full md:w-1/2 flex justify-center items-center">
              <Lottie
                animationData={feature.lottie}
                loop={true}
                className="h-[250px] w-[250px] md:h-[350px] md:w-[350px]"
              />
            </div>

            {/* Text content */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="t3 text-primary">{feature.title}</h3>
              <p className="t4 text-accent">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
