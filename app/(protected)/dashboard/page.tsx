"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/common/section-header";
import { Calendar, Apple, Dumbbell } from "lucide-react";
import { CircularRings } from "@/components/ui/circular-rings";
import { NutritionLogDialog } from "@/components/dashboard/nutrition-log-dialog";
import Link from "next/link";
import { useScheduledWorkouts } from "@/hooks/use-scheduled-workouts";
import { useTodaysNutrition } from "@/hooks/use-nutrition";
import { useSession } from "next-auth/react";
import { startOfDay, endOfDay } from "date-fns";
import { useMemo } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();

  // Fetch today's scheduled workout
  const today = new Date();
  const { data: scheduledWorkouts = [], isLoading: workoutLoading } =
    useScheduledWorkouts(startOfDay(today), endOfDay(today));

  // Fetch today's nutrition
  const { data: nutritionData, isLoading: nutritionLoading } =
    useTodaysNutrition();

  const todaysWorkout = useMemo(() => {
    if (scheduledWorkouts.length === 0) return null;
    const workout = scheduledWorkouts[0];
    return {
      id: workout.id,
      name: workout.template.name,
      exerciseCount: workout.template.exercises.length,
      duration: workout.template.exercises.reduce(
        (acc: number, ex: { sets: number; reps: number; restTime: number }) => {
          return acc + (ex.sets * ex.reps * 3 + ex.sets * ex.restTime) / 60;
        },
        0
      ),
      completed: workout.completed,
    };
  }, [scheduledWorkouts]);

  // Get user goals from profile
  const userWithGoals = session?.user as
    | {
        dailyCalorieGoal?: number;
        proteinGoal?: number;
        carbGoal?: number;
        fatGoal?: number;
      }
    | undefined;

  const calorieGoal = userWithGoals?.dailyCalorieGoal ?? 2000;
  const proteinGoal = userWithGoals?.proteinGoal ?? 150;
  const carbGoal = userWithGoals?.carbGoal ?? 200;
  const fatGoal = userWithGoals?.fatGoal ?? 60;

  // Build nutrition rings with real data
  const nutritionRings = useMemo(() => {
    const summary = nutritionData?.summary || {
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    };

    return [
      {
        name: "Protein",
        actual: summary.totalProtein,
        goal: proteinGoal,
        color: "#3b82f6",
        unit: "g",
      },
      {
        name: "Carbs",
        actual: summary.totalCarbs,
        goal: carbGoal,
        color: "#10b981",
        unit: "g",
      },
      {
        name: "Fats",
        actual: summary.totalFat,
        goal: fatGoal,
        color: "#f59e0b",
        unit: "g",
      },
    ];
  }, [nutritionData, proteinGoal, carbGoal, fatGoal]);

  return (
    <div className="space-y-8">
      {/* Header */}

      <SectionHeader
        title="Welcome back!"
        description="Here's your fitness overview for today"
        titleSize="t1"
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Workout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today&apos;s Workout
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workoutLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading workout...</p>
              </div>
            ) : todaysWorkout ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex-1">
                    <h4 className="t4">{todaysWorkout.name}</h4>
                    <p className="p2 text-muted-foreground mt-1">
                      {todaysWorkout.exerciseCount} exercises •{" "}
                      {Math.round(todaysWorkout.duration)} min
                    </p>
                  </div>
                  {todaysWorkout.completed ? (
                    <Button size="sm" variant="secondary" disabled>
                      Completed ✓
                    </Button>
                  ) : (
                    <Link
                      href={`/active-workout?scheduledWorkoutId=${todaysWorkout.id}`}
                    >
                      <Button size="sm">Start</Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground mb-3">
                  No workout scheduled for today
                </p>
                <Link href="/calendar">
                  <Button size="sm" variant="secondary">
                    Schedule Workout
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nutrition Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-accent" />
              Today&apos;s Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nutritionLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading nutrition...</p>
              </div>
            ) : (
              <>
                <CircularRings
                  rings={nutritionRings}
                  centerContent={{
                    label: "Calories",
                    actual: nutritionData?.summary.totalCalories || 0,
                    goal: calorieGoal,
                  }}
                />
                <NutritionLogDialog />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
