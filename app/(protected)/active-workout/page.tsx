"use client";

import { useState } from "react";
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

// -------------------- Mock Workout --------------------
const mockWorkout = {
  id: "mock-workout-1",
  name: "Full Body Strength",
  description: "A beginner-friendly full body workout",
  exercises: [
    {
      exercise: {
        id: "ex-1",
        name: "Alternate Heel Touchers",
        gifUrl: "",
        bodyPart: "abs",
        equipment: "bodyweight",
        target: "obliques",
        secondaryMuscles: [],
        instructions: ["Lie on your back", "Alternate heel touches"],
      },
      sets: 3,
      reps: 10,
      restTime: 30,
      notes: "Focus on form",
    },
    {
      exercise: {
        id: "ex-2",
        name: "Push Ups",
        gifUrl: "",
        bodyPart: "chest",
        equipment: "bodyweight",
        target: "pectorals",
        secondaryMuscles: ["triceps"],
        instructions: [
          "Keep your back straight",
          "Lower until chest touches floor",
        ],
      },
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "",
    },
  ],
};

// -------------------- Active Workout Page --------------------
export default function ActiveWorkoutPage() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logs, setLogs] = useState<
    { exerciseId: string; setNumber: number; repsDone: number }[]
  >([]);

  const currentExercise = mockWorkout.exercises[currentExerciseIndex];

  if (!currentExercise) {
    return (
      <div className="p-6 text-center">
        <h2 className="t3 font-semibold">Workout Complete! 🎉</h2>
        <p className="mt-2 text-muted-foreground">
          You logged all exercises for {mockWorkout.name}.
        </p>
      </div>
    );
  }

  const handleSetSubmit = (repsDone: number) => {
    // Save log for current set (client-side state)
    setLogs((prev) => [
      ...prev,
      {
        exerciseId: currentExercise.exercise.id,
        setNumber: currentSet,
        repsDone,
      },
    ]);

    // --- Place to call API to save log to DB ---
    // await fetch("/api/workout-log", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     workoutId: mockWorkout.id,
    //     exerciseId: currentExercise.exercise.id,
    //     setNumber: currentSet,
    //     repsDone,
    //   }),
    // });

    // Move to next set or next exercise
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      setLogDialogOpen(true);
    } else {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setLogDialogOpen(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="t3 font-semibold capitalize">
        {currentExercise.exercise.name}
      </h2>
      <p className="text-muted-foreground">
        Set {currentSet} of {currentExercise.sets} — {currentExercise.reps} reps
      </p>

      <ExerciseFormItem
        data={{
          exercise: currentExercise.exercise,
          sets: currentExercise.sets,
          reps: currentExercise.reps,
          restTime: currentExercise.restTime,
          notes: currentExercise.notes || undefined,
        }}
        mode="view"
        showImage={false}
      />

      <ExerciseDetailsDisplay
        exercise={currentExercise.exercise}
        showImage={true}
        imageClassName="h-64 md:h-80 mb-6"
      />

      {/* Log Set Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mt-4">Log Set</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Log {currentExercise.exercise.name} — Set {currentSet}
            </DialogTitle>
            <p className="text-muted-foreground mt-1">
              Enter reps completed for this set
            </p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const reps = parseInt(
                (e.currentTarget.elements.namedItem("reps") as HTMLInputElement)
                  .value
              );
              handleSetSubmit(reps);
              setLogDialogOpen(false);
            }}
            className="space-y-4 mt-4"
          >
            <input
              type="number"
              name="reps"
              defaultValue={currentExercise.reps}
              min={0}
              max={currentExercise.reps}
              className="w-full border p-2 rounded"
            />
            <Button type="submit" className="w-full">
              Save Set
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Logs */}
      <div className="mt-4">
        <h3 className="t5 font-semibold">Logged Sets</h3>
        {logs.map((log, index) => (
          <p key={index} className="text-sm text-muted-foreground">
            Exercise:{" "}
            {
              mockWorkout.exercises.find(
                (e) => e.exercise.id === log.exerciseId
              )?.exercise.name
            }{" "}
            — Set {log.setNumber}: {log.repsDone} reps
          </p>
        ))}
      </div>
    </div>
  );
}
