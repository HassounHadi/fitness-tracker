"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  subDays,
  startOfDay,
} from "date-fns";
import { useMemo } from "react";

interface ConsistencyData {
  date: string;
  workoutCompleted: boolean;
}

interface ConsistencyHeatmapProps {
  workoutDates: string[]; // Array of dates when workouts were completed
  days?: number; // Number of days to show (default: 84 - 12 weeks)
}

export function ConsistencyHeatmap({
  workoutDates,
  days = 84,
}: ConsistencyHeatmapProps) {
  // Create a map of workout dates for quick lookup
  const workoutDateSet = useMemo(() => {
    return new Set(
      workoutDates.map((date) =>
        format(startOfDay(new Date(date)), "yyyy-MM-dd")
      )
    );
  }, [workoutDates]);

  // Generate last N days
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = subDays(end, days - 1);
    return eachDayOfInterval({ start, end });
  }, [days]);

  // Group dates by week
  const weeks = useMemo(() => {
    const weekMap = new Map<string, Date[]>();

    dateRange.forEach((date) => {
      const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
      if (!weekMap.has(weekStart)) {
        weekMap.set(weekStart, []);
      }
      weekMap.get(weekStart)!.push(date);
    });

    return Array.from(weekMap.values());
  }, [dateRange]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalWorkouts = workoutDates.length;
    const totalDays = dateRange.length;
    const consistency = totalDays > 0 ? (totalWorkouts / totalDays) * 100 : 0;

    return {
      totalWorkouts,
      consistency: Math.round(consistency),
      currentStreak: calculateStreak(dateRange.reverse(), workoutDateSet),
    };
  }, [workoutDates, dateRange, workoutDateSet]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Consistency</CardTitle>
        <p className="text-sm text-muted-foreground">
          {stats.consistency}% consistency over the last {days} days
        </p>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">Total Workouts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.consistency}%</p>
            <p className="text-xs text-muted-foreground">Consistency</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="space-y-1 overflow-x-auto">
          {/* Day labels */}
          <div className="flex gap-1 mb-2">
            <div className="w-8" /> {/* Spacer for week labels */}
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <div
                key={i}
                className="w-3 h-3 text-[10px] text-muted-foreground text-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1 items-center">
              {/* Week label */}
              <div className="w-8 text-[10px] text-muted-foreground">
                {format(week[0], "MMM d")}
              </div>

              {/* Days in week */}
              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const date = week[dayIndex];
                  const hasWorkout = date
                    ? workoutDateSet.has(format(date, "yyyy-MM-dd"))
                    : false;
                  const isToday = date ? isSameDay(date, new Date()) : false;

                  return (
                    <div
                      key={dayIndex}
                      className={`
                        w-3 h-3 rounded-sm
                        ${!date ? "bg-transparent" : ""}
                        ${date && !hasWorkout ? "bg-muted" : ""}
                        ${hasWorkout ? "bg-primary" : ""}
                        ${isToday ? "ring-1 ring-accent" : ""}
                      `}
                      title={
                        date
                          ? `${format(date, "MMM d, yyyy")}${
                              hasWorkout ? " - Workout completed" : " - No workout"
                            }`
                          : ""
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted rounded-sm" />
            <span>No workout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span>Workout completed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate current streak
function calculateStreak(dates: Date[], workoutDateSet: Set<string>): number {
  let streak = 0;
  for (const date of dates) {
    if (workoutDateSet.has(format(date, "yyyy-MM-dd"))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
