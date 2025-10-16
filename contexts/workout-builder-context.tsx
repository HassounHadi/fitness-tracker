"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Exercise } from "@prisma/client";

export interface WorkoutExerciseItem {
  exercise: Exercise;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
}

interface WorkoutBuilderContextType {
  exercises: WorkoutExerciseItem[];
  isOpen: boolean;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
  updateExercise: (exerciseId: string, updates: Partial<Omit<WorkoutExerciseItem, "exercise">>) => void;
  clearWorkout: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const WorkoutBuilderContext = createContext<WorkoutBuilderContextType | undefined>(undefined);

export function WorkoutBuilderProvider({ children }: { children: ReactNode }) {
  const [exercises, setExercises] = useState<WorkoutExerciseItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addExercise = (exercise: Exercise) => {
    // Check if exercise already exists
    const exists = exercises.find((item) => item.exercise.id === exercise.id);
    if (exists) {
      return; // Don't add duplicates
    }

    const newItem: WorkoutExerciseItem = {
      exercise,
      sets: 3,
      reps: 10,
      restTime: 90,
    };

    setExercises((prev) => [...prev, newItem]);
    setIsOpen(true); // Auto-open sidebar when adding
  };

  const removeExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((item) => item.exercise.id !== exerciseId));
  };

  const updateExercise = (
    exerciseId: string,
    updates: Partial<Omit<WorkoutExerciseItem, "exercise">>
  ) => {
    setExercises((prev) =>
      prev.map((item) =>
        item.exercise.id === exerciseId ? { ...item, ...updates } : item
      )
    );
  };

  const clearWorkout = () => {
    setExercises([]);
  };

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  return (
    <WorkoutBuilderContext.Provider
      value={{
        exercises,
        isOpen,
        addExercise,
        removeExercise,
        updateExercise,
        clearWorkout,
        openSidebar,
        closeSidebar,
      }}
    >
      {children}
    </WorkoutBuilderContext.Provider>
  );
}

export function useWorkoutBuilder() {
  const context = useContext(WorkoutBuilderContext);
  if (context === undefined) {
    throw new Error("useWorkoutBuilder must be used within a WorkoutBuilderProvider");
  }
  return context;
}
