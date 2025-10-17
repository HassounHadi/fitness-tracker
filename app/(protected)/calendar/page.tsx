"use client";

import { useState, useMemo } from "react";
import { SectionHeader } from "@/components/common/section-header";
import { WeekCalendar } from "@/components/calendar/week-calendar";
import { WorkoutDetails } from "./workout-details";
import { AddWorkoutDialog } from "@/components/calendar/add-workout-dialog";
import { useScheduledWorkouts } from "@/hooks/use-scheduled-workouts";
import { addDays, isSameDay, startOfDay } from "date-fns";

export default function WeekCalendarPage() {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  // Track the current week start (always starts from today or later)
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfDay(new Date()));

  // Calculate week range: currentWeekStart + 7 days
  const weekStart = currentWeekStart;
  const weekEnd = addDays(currentWeekStart, 6);

  // Fetch scheduled workouts for the current week range
  const { data: scheduledWorkouts = [], isLoading } = useScheduledWorkouts(
    weekStart,
    weekEnd
  );

  // Transform scheduled workouts to match the expected format
  const workouts = useMemo(() => {
    return scheduledWorkouts.map((sw) => ({
      id: sw.id,
      date: new Date(sw.scheduledDate),
      name: sw.template.name,
      duration: sw.template.exercises.reduce(
        (acc: number, ex: { sets: number; reps: number; restTime: number }) => {
          // Estimate duration: sets × reps × 3 seconds + rest time
          return acc + (ex.sets * ex.reps * 3 + ex.sets * ex.restTime) / 60;
        },
        0
      ),
      exercises: sw.template.exercises.map(
        (ex: { exercise: { name: any }; sets: any; reps: any }) => ({
          name: ex.exercise.name,
          sets: ex.sets,
          reps: ex.reps,
        })
      ),
      completed: sw.completed,
      isAiGenerated: sw.template.isAiGenerated,
    }));
  }, [scheduledWorkouts]);

  const selectedWorkout = workouts.find((w) => isSameDay(w.date, selectedDay));

  const handleAddWorkout = () => {
    setDialogOpen(true);
  };

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
            workouts={workouts}
            currentWeekStart={currentWeekStart}
            onWeekChange={setCurrentWeekStart}
            isLoading={isLoading}
          />
        </div>

        <div className="flex-1">
          <WorkoutDetails
            workout={selectedWorkout}
            selectedDay={selectedDay}
            onAddWorkout={handleAddWorkout}
          />
        </div>
      </div>

      {/* Add Workout Dialog */}
      <AddWorkoutDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={selectedDay}
      />
    </div>
  );
}
