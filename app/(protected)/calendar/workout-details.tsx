"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { Target, Check } from "lucide-react";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
}

interface Workout {
  id: string;
  date: Date;
  name: string;
  duration: number;
  exercises: Exercise[];
  completed: boolean;
  isAiGenerated?: boolean;
}

interface WorkoutDetailsProps {
  workout: Workout | undefined;
  selectedDay: Date;
  onAddWorkout: () => void;
}

export function WorkoutDetails({ workout, selectedDay, onAddWorkout }: WorkoutDetailsProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-primary">
          {selectedDay.toDateString()}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {!workout ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-primary mb-2">No workout scheduled</p>
            <Button onClick={onAddWorkout} className="mt-2">
              Add Workout
            </Button>
          </div>
        ) : (
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base text-primary">
                    {workout.name}
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-2 text-xs text-accent">
                    <div className="flex items-center gap-1">
                      {workout.duration}min
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {workout.exercises.length} exercises
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center p-2 rounded-full">
                  {workout.completed ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <Link
                      href="/active-workout"
                      className="text-warning font-medium underline text-sm"
                    >
                      Start Workout
                    </Link>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {workout.exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-primary/5"
                >
                  <span className="text-sm text-primary">{ex.name}</span>
                  <span className="text-xs text-accent">
                    {ex.sets} × {ex.reps}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
