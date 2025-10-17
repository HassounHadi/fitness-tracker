"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkoutBuilderExercise } from "@/components/workouts/generate/workout-builder-exercise";
import { Save, Trash2, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkoutExercise } from "@/hooks/use-workout-builder";

interface WorkoutBuilderColumnProps {
  workoutName: string;
  workoutDescription: string;
  workoutExercises: WorkoutExercise[];
  draggedWorkoutIndex: number | null;
  isSaving?: boolean;
  disabled?: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onUpdateExercise: (
    id: string,
    updates: Partial<Omit<WorkoutExercise, "id" | "exercise">>
  ) => void;
  onRemoveExercise: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, dropIndex?: number) => void;
  onDragEnd: () => void;
  onClearWorkout: () => void;
  onSaveWorkout: () => void;
}

export function WorkoutBuilderColumn({
  workoutName,
  workoutDescription,
  workoutExercises,
  draggedWorkoutIndex,
  isSaving = false,
  disabled = false,
  onNameChange,
  onDescriptionChange,
  onUpdateExercise,
  onRemoveExercise,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onClearWorkout,
  onSaveWorkout,
}: WorkoutBuilderColumnProps) {
  return (
    <Card
      onDragOver={disabled ? undefined : onDragOver}
      onDrop={disabled ? undefined : (e) => onDrop(e)}
      className="flex flex-col h-full relative"
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
        <CardTitle className="text-primary">Build Your Workout</CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "flex flex-col flex-1 pr-2 space-y-4",
          workoutExercises.length > 0 ? "overflow-y-auto" : "overflow-hidden"
        )}
      >
        <div className="space-y-2">
          <Label htmlFor="workout-name-desktop">Workout Name</Label>
          <Input
            id="workout-name-desktop"
            placeholder="e.g., Upper Body Blast"
            value={workoutName}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workout-description-desktop">Description</Label>
          <Textarea
            id="workout-description-desktop"
            placeholder="Describe your workout..."
            value={workoutDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={2}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Exercises ({workoutExercises.length})</Label>
          {workoutExercises.length > 0 && (
            <Button
              variant="error"
              size="sm"
              onClick={onClearWorkout}
              className="h-8"
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {workoutExercises.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center flex flex-col items-center justify-center flex-1">
            <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="t5 text-primary mb-2">Drop exercises here</p>
            <p className="p2 text-accent">
              Drag exercises from the left or use AI to generate
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {workoutExercises.map((item, index) => (
              <WorkoutBuilderExercise
                key={item.id}
                exercise={item}
                index={index}
                onUpdate={(updates) => onUpdateExercise(item.id, updates)}
                onRemove={() => onRemoveExercise(item.id)}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
                isDragging={draggedWorkoutIndex === index}
              />
            ))}
          </div>
        )}

        {workoutExercises.length > 0 && (
          <div className="sticky bottom-0 bg-card pt-4 pb-2">
            <Button
              onClick={onSaveWorkout}
              className="w-full gap-2 hover:scale-100"
              size="lg"
              disabled={isSaving || disabled || !workoutName.trim()}
            >
              <Save className={isSaving ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              {isSaving ? "Saving..." : "Save Workout"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
