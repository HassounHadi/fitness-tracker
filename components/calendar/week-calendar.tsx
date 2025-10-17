"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import {
  addDays,
  isSameDay,
  subWeeks,
  addWeeks,
  format,
  startOfDay,
} from "date-fns";
import { Button } from "../ui/button";

interface Workout {
  id: string;
  date: Date;
  name: string;
  completed: boolean;
}

interface WeekCalendarProps {
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  workouts: Workout[];
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  isLoading?: boolean;
}

export function WeekCalendar({
  selectedDay,
  onSelectDay,
  workouts,
  currentWeekStart,
  onWeekChange,
  isLoading,
}: WeekCalendarProps) {
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  const goToPreviousWeek = () => {
    const today = startOfDay(new Date());
    const newWeekStart = subWeeks(currentWeekStart, 1);
    // Don't allow going before today
    if (newWeekStart >= today) {
      onWeekChange(newWeekStart);
    }
  };

  const goToNextWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, 1));
  };

  const goToToday = () => {
    const today = new Date();
    onWeekChange(startOfDay(today));
    onSelectDay(today);
  };

  const getWorkoutForDay = (day: Date) =>
    workouts.find((w) => isSameDay(w.date, day));

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-primary">
          Week of {format(currentWeekStart, "MMM d")}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <div className="flex gap-2 w-max">
          {weekDays.map((day) => {
            const workout = getWorkoutForDay(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDay);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDay(day)}
                className={`
            flex-shrink-0 w-20 p-2 rounded-lg border-2 transition-all
            ${
              isSelected
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50"
            }
            ${isToday && !isSelected ? "ring-2 ring-accent/30" : ""}
          `}
              >
                <p className="text-xs text-accent text-center">
                  {format(day, "EEE")}
                </p>
                <p className="text-2xl font-bold text-center">
                  {format(day, "d")}
                </p>
                <div className="mt-2 flex justify-center">
                  {workout ? (
                    <span className="text-[10px] px-1.5 py-0 bg-primary/10 rounded">
                      {workout.name}
                    </span>
                  ) : (
                    <Dumbbell className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
