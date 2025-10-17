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
  onExerciseClick?: (exercise: Exercise) => void;
  disabled?: boolean;
  isMobile?: boolean;
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
  onExerciseClick,
  disabled = false,
  isMobile = false,
}: WorkoutExerciseLibraryProps) {
  return (
    <Card
      className="flex flex-col h-full relative"
      onDragOver={disabled || isMobile ? undefined : onDragOver}
      onDrop={disabled || isMobile ? undefined : onDrop}
    >
      {disabled && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <p className="t5 text-primary mb-2">AI is generating workout...</p>
            <p className="p3 text-accent">Please wait</p>
          </div>
        </div>
      )}
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
                {isMobile
                  ? "Tap exercises to add them to your workout"
                  : "Drag exercises to your workout or drag from workout to remove"}
              </p>
              {exercises.slice(0, 50).map((exercise) => (
                <div
                  key={exercise.id}
                  draggable={!disabled && !isMobile}
                  onDragStart={disabled || isMobile ? undefined : (e) => onDragStart(e, exercise)}
                  onClick={isMobile && !disabled ? () => onExerciseClick?.(exercise) : undefined}
                  className={
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : isMobile
                      ? "cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98]"
                      : "cursor-move"
                  }
                >
                  <DraggableExerciseCard exercise={exercise} />
                </div>
              ))}
            </>
          )}

          {!isLoading && exercises.length === 0 && (
            <div
              className="text-center py-12 min-h-[300px] border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center bg-primary/5 transition-colors hover:border-primary/50 hover:bg-primary/10"
              onDragOver={isMobile ? undefined : onDragOver}
              onDrop={isMobile ? undefined : onDrop}
            >
              <div>
                <Dumbbell className="h-12 w-12 text-primary/50 mx-auto mb-3" />
                <p className="p2 text-accent mb-1">No exercises found</p>
                {!isMobile && (
                  <p className="p3 text-muted-foreground">
                    Drag exercises here to remove from workout
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
