"use client";

import { StatCard } from "@/components/progress/stat-card";
import { ProgressLogDialog } from "@/components/progress/progress-log-dialog";
import { Dumbbell, Target, Activity } from "lucide-react";
import { useLatestProgress, useProgressLogs } from "@/hooks/use-progress";
import { useNutritionLogs } from "@/hooks/use-nutrition";
import { useWorkoutStats } from "@/hooks/use-workout-stats";
import { WeightTrendsChart } from "@/components/progress/weight-trends-chart";
import { BodyMeasurementsChart } from "@/components/progress/body-measurements-chart";
import { WorkoutVolumeChart } from "@/components/progress/workout-volume-chart";
import { ConsistencyHeatmap } from "@/components/progress/consistency-heatmap";
import { NutritionProgressChart } from "@/components/progress/nutrition-progress-chart";
import { ChartSkeleton } from "@/components/progress/chart-skeleton";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { subDays } from "date-fns";

export default function ProgressPage() {
  const { data: session } = useSession();
  const { data: latestProgress } = useLatestProgress();
  const { data: allProgress = [], isLoading: isLoadingProgress } = useProgressLogs();

  // Fetch data for charts - last 30 days
  // Use useMemo to prevent creating new date objects on every render
  const dateRange = useMemo(() => {
    const daysToShow = 30;
    const endDate = new Date();
    const startDate = subDays(endDate, daysToShow);
    return { startDate, endDate, daysToShow };
  }, []);

  const { data: nutritionLogs = [], isLoading: isLoadingNutrition } = useNutritionLogs(dateRange.startDate, dateRange.endDate);
  const { data: workoutStats = [], isLoading: isLoadingWorkouts } = useWorkoutStats(dateRange.daysToShow);

  // Calculate progress trends
  const progressStats = useMemo(() => {
    if (!latestProgress || allProgress.length < 2) {
      return {
        weightTrend: undefined,
        bodyFatTrend: undefined,
        previousWeight: null,
        previousBodyFat: null,
      };
    }

    // Get second latest for comparison
    const previousProgress = allProgress[1];

    let weightTrend: { value: number; isPositive: boolean } | undefined =
      undefined;
    let bodyFatTrend: { value: number; isPositive: boolean } | undefined =
      undefined;

    if (latestProgress.weight && previousProgress?.weight) {
      const diff = latestProgress.weight - previousProgress.weight;
      weightTrend = {
        value: Math.abs(diff),
        isPositive: diff < 0, // Weight loss is positive
      };
    }

    if (latestProgress.bodyFat && previousProgress?.bodyFat) {
      const diff = latestProgress.bodyFat - previousProgress.bodyFat;
      bodyFatTrend = {
        value: Math.abs(diff),
        isPositive: diff < 0, // Body fat loss is positive
      };
    }

    return {
      weightTrend,
      bodyFatTrend,
      previousWeight: previousProgress?.weight,
      previousBodyFat: previousProgress?.bodyFat,
    };
  }, [latestProgress, allProgress]);

  // User's target weight and nutrition goals from profile
  const userWithGoals = session?.user as
    | {
        targetWeight?: number;
        dailyCalorieGoal?: number;
        proteinGoal?: number;
        carbGoal?: number;
        fatGoal?: number;
      }
    | undefined;

  const targetWeight = userWithGoals?.targetWeight;
  const nutritionGoals = {
    calories: userWithGoals?.dailyCalorieGoal ?? 2000,
    protein: userWithGoals?.proteinGoal ?? 150,
    carbs: userWithGoals?.carbGoal ?? 200,
    fat: userWithGoals?.fatGoal ?? 60,
  };

  // Prepare data for charts
  const weightData = useMemo(
    () =>
      allProgress.map((p) => ({
        date: p.date,
        weight: p.weight,
        bodyFat: p.bodyFat,
      })),
    [allProgress]
  );

  const measurementData = useMemo(
    () =>
      allProgress.map((p) => ({
        date: p.date,
        chest: p.chest,
        waist: p.waist,
        hips: p.hips,
        biceps: p.biceps,
        thighs: p.thighs,
      })),
    [allProgress]
  );

  const workoutDates = useMemo(
    () => workoutStats.map((stat) => stat.date),
    [workoutStats]
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="t1 text-primary">Progress Tracking</h1>
          <p className="p1 text-accent mt-2">
            Track your fitness journey and body measurements
          </p>
        </div>
        <ProgressLogDialog />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Weight */}
        <StatCard
          title="Current Weight"
          value={
            latestProgress?.weight
              ? `${latestProgress.weight.toFixed(1)} kg`
              : "No data"
          }
          description={
            targetWeight
              ? `Target: ${targetWeight} kg`
              : latestProgress?.weight
              ? "Set target in profile"
              : "Log your first weight"
          }
          icon={Target}
          trend={progressStats.weightTrend}
        />

        {/* Body Fat */}
        <StatCard
          title="Body Fat"
          value={
            latestProgress?.bodyFat
              ? `${latestProgress.bodyFat.toFixed(1)}%`
              : "No data"
          }
          description={
            progressStats.previousBodyFat
              ? `Previous: ${progressStats.previousBodyFat.toFixed(1)}%`
              : latestProgress?.bodyFat
              ? "Keep tracking!"
              : "Log your body fat %"
          }
          icon={Activity}
          trend={progressStats.bodyFatTrend}
        />

        {/* Total Progress Logs */}
        <StatCard
          title="Progress Entries"
          value={(allProgress?.length ?? 0).toString()}
          description={
            allProgress?.length > 0
              ? `Last logged: ${new Date(
                  allProgress[0]?.date
                ).toLocaleDateString()}`
              : "Start logging progress"
          }
          icon={Dumbbell}
        />
      </div>

      {/* Measurements Section */}
      {latestProgress && (
        <div className="mt-6">
          <h2 className="t3 text-primary mb-4">Latest Measurements</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {latestProgress.chest && (
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-accent">Chest</p>
                <p className="t4 font-semibold text-primary">
                  {latestProgress.chest} cm
                </p>
              </div>
            )}
            {latestProgress.waist && (
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-accent">Waist</p>
                <p className="t4 font-semibold text-primary">
                  {latestProgress.waist} cm
                </p>
              </div>
            )}
            {latestProgress.hips && (
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-accent">Hips</p>
                <p className="t4 font-semibold text-primary">
                  {latestProgress.hips} cm
                </p>
              </div>
            )}
            {latestProgress.biceps && (
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-accent">Biceps</p>
                <p className="t4 font-semibold text-primary">
                  {latestProgress.biceps} cm
                </p>
              </div>
            )}
            {latestProgress.thighs && (
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-accent">Thighs</p>
                <p className="t4 font-semibold text-primary">
                  {latestProgress.thighs} cm
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {latestProgress?.notes && (
        <div className="mt-4">
          <h3 className="t4 text-primary mb-2">Latest Notes</h3>
          <div className="p-4 border rounded-lg bg-muted/20">
            <p className="text-sm text-primary">{latestProgress.notes}</p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="mt-8">
        <h2 className="t2 text-primary mb-6">Analytics & Trends</h2>

        {/* Weight & Body Fat Trends */}
        <div className="mb-6">
          {isLoadingProgress ? (
            <ChartSkeleton />
          ) : (
            <WeightTrendsChart data={weightData} targetWeight={targetWeight} />
          )}
        </div>

        {/* Workout Volume & Consistency Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {isLoadingWorkouts ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <WorkoutVolumeChart data={workoutStats} />
              <ConsistencyHeatmap workoutDates={workoutDates} days={84} />
            </>
          )}
        </div>

        {/* Body Measurements Chart */}
        <div className="mb-6">
          {isLoadingProgress ? (
            <ChartSkeleton />
          ) : (
            <BodyMeasurementsChart data={measurementData} />
          )}
        </div>

        {/* Nutrition Progress Chart */}
        <div className="mb-6">
          {isLoadingNutrition ? (
            <ChartSkeleton />
          ) : (
            <NutritionProgressChart data={nutritionLogs} goals={nutritionGoals} />
          )}
        </div>
      </div>
    </div>
  );
}
