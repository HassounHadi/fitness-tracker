"use client";

import { ExerciseCard } from "./exercise-card";
import type { Exercise } from "@prisma/client";

export interface ExerciseGridProps {
  exercises: Exercise[];
  onViewDetails?: (id: string) => void;
}

export function ExerciseGrid({ exercises, onViewDetails }: ExerciseGridProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="p1 text-muted-foreground">
          No exercises found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
