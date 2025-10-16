"use client";

import { ExerciseCard } from "./exercise-card";

export interface Exercise {
  id: string;
  name: string;
  gifUrl: string;
  bodyPart: string;
  equipment: string;
  target: string;
  isSaved?: boolean;
}

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
          {...exercise}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
