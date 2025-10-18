"use client";

import { StatCard } from "@/components/progress/stat-card";
import { ProgressLogDialog } from "@/components/progress/progress-log-dialog";
import { Dumbbell, Target, Activity } from "lucide-react";
import { useLatestProgress, useProgressLogs } from "@/hooks/use-progress";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export default function ProgressPage() {
  const { data: session } = useSession();
  const { data: latestProgress } = useLatestProgress();
  const { data: allProgress = [] } = useProgressLogs();

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

  // User's target weight from profile
  const targetWeight = (session?.user as { targetWeight?: number })
    ?.targetWeight;

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
    </div>
  );
}
