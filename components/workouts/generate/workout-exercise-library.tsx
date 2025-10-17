"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseFilters } from "@/components/exercises/exercise-filters";
import { LoadingState } from "@/components/common/loading-state";
import { DraggableExerciseCard } from "@/components/workouts/generate/draggable-exercise-card";
import { Dumbbell } from "lucide-react";
import type { Exercise } from "@prisma/client";

interface WorkoutExerciseLibraryProps {
  exercises: Exercise[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedBodyPart: string | null;
  onBodyPartChange: (value: string | null) => void;
  selectedEquipment: string | null;
  onEquipmentChange: (value: string | null) => void;
  selectedTarget: string | null;
  onTargetChange: (value: string | null) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  onDragStart: (e: React.DragEvent, exercise: Exercise) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function WorkoutExerciseLibrary({
  exercises,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  selectedBodyPart,
  onBodyPartChange,
  selectedEquipment,
  onEquipmentChange,
  selectedTarget,
  onTargetChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  onDragStart,
  onDragOver,
  onDrop,
}: WorkoutExerciseLibraryProps) {
  return (
    <Card
      className="flex flex-col h-full"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-primary">Exercise Library</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 overflow-hidden space-y-4">
        <div className="flex-shrink-0">
          <ExerciseFilters
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            selectedBodyPart={selectedBodyPart}
            onBodyPartChange={onBodyPartChange}
            selectedEquipment={selectedEquipment}
            onEquipmentChange={onEquipmentChange}
            selectedTarget={selectedTarget}
            onTargetChange={onTargetChange}
            showFilters={showFilters}
            onToggleFilters={onToggleFilters}
            onClearFilters={onClearFilters}
          />
        </div>

        <div
          className="flex-1 overflow-y-auto space-y-2 pr-2"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {isLoading && <LoadingState size="sm" />}

          {!isLoading && !error && exercises.length > 0 && (
            <>
              <p className="p3 text-accent sticky top-0 bg-card py-2 z-10">
                Drag exercises to your workout or drag from workout to remove
              </p>
              {exercises.slice(0, 50).map((exercise) => (
                <div
                  key={exercise.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, exercise)}
                  className="cursor-move"
                >
                  <DraggableExerciseCard exercise={exercise} />
                </div>
              ))}
            </>
          )}

          {!isLoading && exercises.length === 0 && (
            <div
              className="text-center py-12 min-h-[300px] border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center bg-primary/5 transition-colors hover:border-primary/50 hover:bg-primary/10"
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              <div>
                <Dumbbell className="h-12 w-12 text-primary/50 mx-auto mb-3" />
                <p className="p2 text-accent mb-1">No exercises found</p>
                <p className="p3 text-muted-foreground">
                  Drag exercises here to remove from workout
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
