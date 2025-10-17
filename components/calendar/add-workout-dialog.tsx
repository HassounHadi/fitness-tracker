"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkouts } from "@/hooks/use-workouts";
import { useScheduleWorkout } from "@/hooks/use-scheduled-workouts";
import { WorkoutGrid } from "@/components/workouts/workout-grid";
import { LoadingState } from "@/components/common/loading-state";
import { Dumbbell, Sparkles } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface AddWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

export function AddWorkoutDialog({
  open,
  onOpenChange,
  selectedDate,
}: AddWorkoutDialogProps) {
  const { data: workouts = [], isLoading, error } = useWorkouts();
  const scheduleWorkoutMutation = useScheduleWorkout();
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null
  );

  const handleSelectWorkout = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
  };

  const handleSchedule = async () => {
    if (!selectedWorkoutId) return;

    try {
      await scheduleWorkoutMutation.mutateAsync({
        templateId: selectedWorkoutId,
        scheduledDate: selectedDate,
      });

      // Close dialog and reset selection
      setSelectedWorkoutId(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to schedule workout:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Add Workout</DialogTitle>
          <DialogDescription>
            Choose a workout to schedule for{" "}
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoadingState size="sm" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-error">Failed to load workouts</p>
            </div>
          )}

          {!isLoading && !error && workouts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="t5 text-primary mb-2">No Workouts Available</h3>
              <p className="p3 text-accent mb-4">
                Create a workout first to schedule it
              </p>
              <Link href="/workouts/generate">
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate AI Workout
                </Button>
              </Link>
            </div>
          )}

          {!isLoading && !error && workouts.length > 0 && (
            <div className="space-y-4">
              <p className="p3 text-accent">
                Select a workout from your saved templates:
              </p>
              <div className="space-y-3">
                {workouts.map((workout) => (
                  <button
                    key={workout.id}
                    onClick={() => handleSelectWorkout(workout.id)}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${
                        selectedWorkoutId === workout.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="t5 text-primary">{workout.name}</h4>
                        {workout.description && (
                          <p className="p3 text-accent mt-1 line-clamp-2">
                            {workout.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-accent">
                            {workout.exercises.length} exercises
                          </span>
                          {workout.isAiGenerated && (
                            <span className="text-xs text-accent flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI Generated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedWorkoutId(null);
              onOpenChange(false);
            }}
            disabled={scheduleWorkoutMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!selectedWorkoutId || scheduleWorkoutMutation.isPending}
            loading={scheduleWorkoutMutation.isPending}
            loadingText="Scheduling..."
          >
            Schedule Workout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
