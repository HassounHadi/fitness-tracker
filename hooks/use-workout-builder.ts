import { useState, useCallback } from "react";
import type { Exercise } from "@prisma/client";

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
}

export function useWorkoutBuilder() {
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [removedExerciseIds, setRemovedExerciseIds] = useState<string[]>([]);
  const [draggedWorkoutIndex, setDraggedWorkoutIndex] = useState<number | null>(null);

  const addExercise = useCallback(
    (exercise: Exercise, insertIndex?: number) => {
      const newExercise: WorkoutExercise = {
        id: `${exercise.id}-${Date.now()}`,
        exercise,
        sets: 3,
        reps: 10,
        restTime: 60,
      };

      // Remove exercise from library
      setRemovedExerciseIds((prev) => [...prev, exercise.id]);

      // Add to workout at specific index or at the end
      if (insertIndex !== undefined && insertIndex >= 0) {
        setWorkoutExercises((prev) => {
          const updated = [...prev];
          updated.splice(insertIndex, 0, newExercise);
          return updated;
        });
      } else {
        setWorkoutExercises((prev) => [...prev, newExercise]);
      }
    },
    []
  );

  const removeExercise = useCallback((id: string) => {
    setWorkoutExercises((prev) => {
      const exercise = prev.find((ex) => ex.id === id);
      if (exercise) {
        // Add exercise back to library
        setRemovedExerciseIds((removed) =>
          removed.filter((exId) => exId !== exercise.exercise.id)
        );
      }
      return prev.filter((ex) => ex.id !== id);
    });
  }, []);

  const updateExercise = useCallback(
    (id: string, updates: Partial<Omit<WorkoutExercise, "id" | "exercise">>) => {
      setWorkoutExercises((prev) =>
        prev.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex))
      );
    },
    []
  );

  const reorderExercises = useCallback((fromIndex: number, toIndex: number) => {
    setWorkoutExercises((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  const clearWorkout = useCallback(() => {
    setRemovedExerciseIds([]);
    setWorkoutExercises([]);
    setWorkoutName("");
    setWorkoutDescription("");
  }, []);

  return {
    // State
    workoutName,
    workoutDescription,
    workoutExercises,
    removedExerciseIds,
    draggedWorkoutIndex,

    // Setters
    setWorkoutName,
    setWorkoutDescription,
    setDraggedWorkoutIndex,

    // Actions
    addExercise,
    removeExercise,
    updateExercise,
    reorderExercises,
    clearWorkout,
  };
}
