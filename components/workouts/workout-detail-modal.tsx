"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { ExerciseFormItem } from "@/components/exercises/exercise-form-item";
import { ExerciseDetailsDisplay } from "@/components/exercises/exercise-details-display";
import { cn } from "@/lib/utils";
import type { WorkoutWithExercises } from "@/hooks/use-workouts";

interface WorkoutDetailModalProps {
  workout: WorkoutWithExercises | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkoutDetailModal({
  workout,
  open,
  onOpenChange,
}: WorkoutDetailModalProps) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  if (!workout) return null;

  const activeExercise = workout.exercises[activeExerciseIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-screen sm:!max-w-[90vw] !h-screen sm:max-h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="t3 capitalize pr-8">
              {workout.name}
            </DialogTitle>
            {workout.description && (
              <p className="p2 text-muted-foreground mt-2">
                {workout.description}
              </p>
            )}
          </DialogHeader>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 md:hidden bg-background/80 hover:bg-background z-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Content - Side by Side on Desktop, Dropdown on Mobile */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Mobile Dropdown - Exercise Selector */}
            <div className="md:hidden px-4 py-3 border-b flex-shrink-0">
              <Select
                value={activeExerciseIndex.toString()}
                onValueChange={(value) =>
                  setActiveExerciseIndex(parseInt(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="capitalize">
                      {activeExerciseIndex + 1}. {activeExercise.exercise.name}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {workout.exercises.map((item, index) => (
                    <SelectItem key={item.exercise.id} value={index.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          {index + 1}.
                        </span>
                        <span className="capitalize">{item.exercise.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({item.sets}×{item.reps})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Left Side - Exercise List */}
            <div className="hidden md:flex w-full md:w-2/5 border-r flex-col overflow-hidden">
              <div className="px-4 py-3 border-b flex-shrink-0">
                <h3 className="t5 font-semibold">
                  Exercises ({workout.exercises.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {workout.exercises.map((item, index) => (
                    <button
                      key={item.exercise.id}
                      onClick={() => setActiveExerciseIndex(index)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        activeExerciseIndex === index
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="t6 capitalize line-clamp-1">
                            {item.exercise.name}
                          </p>
                          <p className="p3 text-muted-foreground mt-1">
                            {item.sets} sets × {item.reps} reps
                          </p>
                        </div>
                        <div
                          className={cn(
                            "text-2xl font-bold text-muted-foreground",
                            activeExerciseIndex === index && "text-primary"
                          )}
                        >
                          {index + 1}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Exercise Details (Full width on mobile) */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6 space-y-6">
                {/* Exercise Form (View Mode) */}
                <ExerciseFormItem
                  data={{
                    exercise: activeExercise.exercise,
                    sets: activeExercise.sets,
                    reps: activeExercise.reps,
                    restTime: activeExercise.restTime,
                    notes: activeExercise.notes || undefined,
                  }}
                  mode="view"
                  showImage={false}
                />

                {/* Exercise Details */}
                <div className="border-t pt-6">
                  <h3 className="t4 font-semibold mb-4 capitalize">
                    {activeExercise.exercise.name}
                  </h3>
                  <ExerciseDetailsDisplay
                    exercise={activeExercise.exercise}
                    showImage={true}
                    imageClassName="h-64 md:h-80 mb-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
