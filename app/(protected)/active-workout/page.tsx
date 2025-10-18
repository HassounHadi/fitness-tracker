"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExerciseFormItem } from "@/components/exercises/exercise-form-item";
import { ExerciseDetailsDisplay } from "@/components/exercises/exercise-details-display";
import { SectionHeader } from "@/components/common/section-header";
import {
  useStartWorkout,
  useStartExercise,
  useCreateSet,
  useCompleteWorkout,
  type WorkoutLog,
} from "@/hooks/use-workout-log";
import { Loader2 } from "lucide-react";

// Type for Exercise from WorkoutLog
interface Exercise {
  id: string;
  name: string;
  target: string;
  apiId: string;
  gifUrl: string;
  bodyPart: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// -------------------- Active Workout Page --------------------
export default function ActiveWorkoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scheduledWorkoutId = searchParams.get("scheduledWorkoutId");

  const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);

  // Use ref to track if workout has been started to prevent duplicate calls
  const hasStartedRef = useRef(false);

  const startWorkoutMutation = useStartWorkout();
  const startExerciseMutation = useStartExercise();
  const createSetMutation = useCreateSet();
  const completeWorkoutMutation = useCompleteWorkout();

  // Track when workoutLog changes
  useEffect(() => {}, [workoutLog]);

  // Start the workout when component mounts - ONLY ONCE
  useEffect(() => {
    if (scheduledWorkoutId && !hasStartedRef.current && !workoutLog) {
      hasStartedRef.current = true;

      startWorkoutMutation
        .mutateAsync({ scheduledWorkoutId })
        .then((data) => {
          setWorkoutLog(data ?? null);
          setWorkoutStartTime(new Date());
        })
        .catch((error) => {
          console.error("❌ MUTATE ASYNC ERROR:", error);
          hasStartedRef.current = false;
          router.push("/calendar");
        });
    }
  }, [scheduledWorkoutId, startWorkoutMutation, workoutLog, router]);

  // Use template exercises for UI, logged exercises for tracking completion
  const templateExercises = workoutLog?.templateExercises || [];
  const loggedExercises = workoutLog?.exercises || [];

  const currentTemplateExercise = templateExercises[currentExerciseIndex];
  const currentLoggedExercise = loggedExercises.find(
    (ex) => ex.exerciseId === currentTemplateExercise?.exerciseId
  );

  // If no workout log yet, show a simple message
  if (!workoutLog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-primary">Preparing workout...</p>
        </div>
      </div>
    );
  }

  // Workout complete state - check if all template exercises are done
  if (
    !currentTemplateExercise ||
    currentExerciseIndex >= templateExercises.length
  ) {
    const handleFinishWorkout = () => {
      if (!workoutLog || !workoutStartTime) return;

      const duration = Math.floor(
        (new Date().getTime() - workoutStartTime.getTime()) / 1000 / 60
      );

      completeWorkoutMutation.mutate(
        {
          workoutLogId: workoutLog.id,
          duration,
        },
        {
          onSuccess: () => {
            router.push("/calendar");
          },
        }
      );
    };

    return (
      <div className="p-4 text-center space-y-4">
        <SectionHeader
          title="Workout Complete! 🎉"
          description={`You have completed the ${workoutLog.name} workout.`}
        />
        <Button
          onClick={handleFinishWorkout}
          disabled={completeWorkoutMutation.isPending}
        >
          {completeWorkoutMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Finish Workout"
          )}
        </Button>
      </div>
    );
  }

  // Start the current exercise if not already started
  const handleStartExercise = () => {
    if (!currentTemplateExercise || currentLoggedExercise) return;

    startExerciseMutation
      .mutateAsync({
        workoutLogId: workoutLog.id,
        exerciseId: currentTemplateExercise.exerciseId,
        order: currentExerciseIndex,
        notes: currentTemplateExercise.notes || undefined,
      })
      .then((loggedExercise) => {
        if (!loggedExercise) {
          console.error("No logged exercise returned from API");
          return;
        }

        // Update local state with new logged exercise
        setWorkoutLog((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            exercises: [...prev.exercises, loggedExercise],
          };
        });
      })
      .catch((error) => {
        console.error("❌ Failed to start exercise:", error);
      });
  };

  // Log a set (create new set in incremental flow)
  const handleSetSubmit = (repsDone: number, weight?: number) => {
    if (!currentLoggedExercise) return;

    createSetMutation
      .mutateAsync({
        loggedExerciseId: currentLoggedExercise.id,
        setNumber: currentSetIndex + 1,
        reps: repsDone,
        weight: weight || null,
      })
      .then((newSet) => {
        if (!newSet) {
          console.error("No set returned from API");
          return;
        }

        // Update local state
        setWorkoutLog((prev) => {
          if (!prev) return prev;

          const newExercises = prev.exercises.map((ex) => {
            if (ex.id === currentLoggedExercise.id) {
              return {
                ...ex,
                sets: [...ex.sets, newSet],
              };
            }
            return ex;
          });

          return { ...prev, exercises: newExercises };
        });

        // Move to next set or exercise
        if (currentSetIndex < currentTemplateExercise.sets - 1) {
          setCurrentSetIndex(currentSetIndex + 1);
        } else {
          // Move to next exercise
          setCurrentExerciseIndex(currentExerciseIndex + 1);
          setCurrentSetIndex(0);
        }
      })
      .catch((error) => {
        console.error("❌ Failed to log set:", error);
      });
  };

  // Calculate completed sets for current logged exercise
  const completedSets =
    currentLoggedExercise?.sets.filter((s) => s.completed).length || 0;

  // If exercise hasn't been started yet, show a button to start it
  if (!currentLoggedExercise) {
    return (
      <div className="p-4 space-y-4">
        <div>
          <h2 className="t3 font-semibold capitalize">
            {currentTemplateExercise.exercise.name}
          </h2>
          <p className="text-muted-foreground">
            Exercise {currentExerciseIndex + 1} of {templateExercises.length}
          </p>
        </div>

        <ExerciseDetailsDisplay
          exercise={currentTemplateExercise.exercise as Exercise}
          showImage={true}
          imageClassName="h-48 md:h-64 rounded-md"
        />

        <Button
          onClick={handleStartExercise}
          className="w-full"
          disabled={startExerciseMutation.isPending}
        >
          {startExerciseMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Starting...
            </>
          ) : (
            "Start Exercise"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 md:space-y-0 md:flex md:gap-6">
      {/* Left Column - Form + Logs */}
      <div className="md:w-1/2 space-y-4">
        <div>
          <h2 className="t3 font-semibold capitalize">
            {currentTemplateExercise.exercise.name}
          </h2>
          <p className="text-muted-foreground">
            Exercise {currentExerciseIndex + 1} of {templateExercises.length}
          </p>
          <p className="text-accent">
            Set {currentSetIndex + 1} of {currentTemplateExercise.sets} (
            {completedSets} completed)
          </p>
        </div>

        <ExerciseFormItem
          data={{
            exercise: currentTemplateExercise.exercise as Exercise,
            sets: currentTemplateExercise.sets,
            reps: currentTemplateExercise.reps,
            restTime: 60, // Default rest time
            notes: currentTemplateExercise.notes || undefined,
          }}
          mode="view"
          showImage={false}
        />

        {/* Log Set Dialog */}
        <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full"
              disabled={completedSets >= currentTemplateExercise.sets}
            >
              {completedSets >= currentTemplateExercise.sets
                ? "Exercise Complete"
                : "Log Set"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>
                Log {currentTemplateExercise.exercise.name} — Set{" "}
                {currentSetIndex + 1}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                Enter reps and weight for this set
              </p>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const reps = parseInt(formData.get("reps") as string);
                const weight = formData.get("weight")
                  ? parseFloat(formData.get("weight") as string)
                  : undefined;
                handleSetSubmit(reps, weight);
                setLogDialogOpen(false);
              }}
              className="space-y-4 mt-4"
            >
              <div>
                <label className="text-sm font-medium">Reps</label>
                <input
                  type="number"
                  name="reps"
                  defaultValue={currentTemplateExercise.reps}
                  min={0}
                  required
                  className="w-full border p-2 rounded mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Weight (kg) - Optional
                </label>
                <input
                  type="number"
                  name="weight"
                  step="0.5"
                  min={0}
                  placeholder="0"
                  className="w-full border p-2 rounded mt-1"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createSetMutation.isPending}
              >
                {createSetMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Set"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Logged Sets */}
        <div className="mt-4 space-y-2">
          <h3 className="t5 font-semibold">Completed Sets</h3>
          <div className="space-y-1">
            {loggedExercises.map((ex) => {
              const completedSetsForEx = ex.sets.filter((s) => s.completed);
              if (completedSetsForEx.length === 0) return null;

              return (
                <div key={ex.id} className="text-sm">
                  <p className="font-medium text-primary">{ex.exercise.name}</p>
                  {completedSetsForEx.map((set) => (
                    <p key={set.id} className="text-muted-foreground ml-4">
                      Set {set.setNumber}: {set.reps} reps
                      {set.weight ? ` @ ${set.weight}kg` : ""}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column - Details */}
      <div className="md:w-1/2 space-y-4">
        <ExerciseDetailsDisplay
          exercise={currentTemplateExercise.exercise as Exercise}
          showImage={true}
          imageClassName="h-48 md:h-64 rounded-md"
        />
      </div>
    </div>
  );
}
