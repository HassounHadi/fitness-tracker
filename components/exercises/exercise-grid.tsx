"use client";

import { ExerciseCard } from "./exercise-card";
import { EmptyState } from "@/components/common/empty-state";
import type { Exercise } from "@prisma/client";

export interface ExerciseGridProps {
  exercises: Exercise[];
  onViewDetails?: (id: string) => void;
}

export function ExerciseGrid({ exercises, onViewDetails }: ExerciseGridProps) {
  if (exercises.length === 0) {
    return (
      <EmptyState
        variant="simple"
        title="No exercises found"
        description="Try adjusting your filters."
      />
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
