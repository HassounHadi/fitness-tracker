"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/common/section-header";
import { WeekCalendar } from "@/components/calendar/week-calendar";
import { WorkoutDetails } from "./workout-details";

// Mock data
const mockWorkouts = [
  {
    id: "1",
    date: new Date(),
    name: "Upper Body Blast",
    duration: 45,
    exercises: [
      { name: "Bench Press", sets: 4, reps: 10 },
      { name: "Pull-ups", sets: 3, reps: 12 },
    ],
    completed: true,
    isAiGenerated: true,
  },
  {
    id: "2",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    name: "Leg Day Power",
    duration: 60,
    exercises: [
      { name: "Squats", sets: 5, reps: 8 },
      { name: "Deadlifts", sets: 4, reps: 6 },
    ],
    completed: false,
    isAiGenerated: true,
  },
];

export default function WeekCalendarPage() {
  const [selectedDay, setSelectedDay] = useState(new Date());

  const selectedWorkout = mockWorkouts.find(
    (w) => w.date.toDateString() === selectedDay.toDateString()
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Section Header spans full width */}
      <SectionHeader
        title="Workout Calendar"
        description="Plan and track your workouts this week"
        titleSize="t1"
      />

      {/* Calendar + Workout details row */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <WeekCalendar
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            workouts={mockWorkouts}
          />
        </div>

        <div className="flex-1">
          <WorkoutDetails workout={selectedWorkout} selectedDay={selectedDay} />
        </div>
      </div>
    </div>
  );
}
