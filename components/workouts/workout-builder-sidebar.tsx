"use client";

import { useState } from "react";
import { useWorkoutBuilder } from "@/contexts/workout-builder-context";
import { useCreateWorkout } from "@/hooks/use-workouts";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Save, Dumbbell } from "lucide-react";
import { ExerciseFormItem } from "@/components/exercises/exercise-form-item";

export function WorkoutBuilderSidebar() {
  const {
    exercises,
    isOpen,
    closeSidebar,
    removeExercise,
    updateExercise,
    clearWorkout,
  } = useWorkoutBuilder();

  const router = useRouter();
  const createWorkout = useCreateWorkout();

  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");

  const handleSaveWorkout = async () => {
    if (!workoutName.trim() || exercises.length === 0) return;

    try {
      await createWorkout.mutateAsync({
        name: workoutName.trim(),
        description: workoutDescription.trim() || undefined,
        exercises: exercises.map((item) => ({
          exerciseId: item.exercise.id,
          sets: item.sets,
          reps: item.reps,
          restTime: item.restTime,
          notes: item.notes,
        })),
      });

      // Clear form and workout on success
      setWorkoutName("");
      setWorkoutDescription("");
      clearWorkout();
      closeSidebar();

      // Navigate to workouts page
      router.push("/workouts");
    } catch (error) {
      console.error("Error saving workout:", error);
      // Error toast is handled by the mutation
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeSidebar}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 h-full max-h-screen">
        <SheetHeader className="px-6 pt-4 pb-2">
          <SheetTitle className="flex items-center gap-2 text-primary">
            <Dumbbell className="h-5 w-5" />
            Build Your Workout
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="t5 font-semibold mb-2">No exercises added yet</p>
            <p className="p3 text-muted-foreground">
              Browse exercises and click "Add" to build your workout
            </p>
          </div>
        ) : (
          <>
            {/* Workout Details Form */}
            <div className="px-6 py-4 space-y-4 flex-shrink-0">
              <div className="space-y-2">
                <Label htmlFor="workout-name">Workout Name *</Label>
                <Input
                  id="workout-name"
                  placeholder="e.g., Upper Body Strength"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workout-description">Description</Label>
                <Textarea
                  id="workout-description"
                  placeholder="Brief description of your workout..."
                  value={workoutDescription}
                  onChange={(e) => setWorkoutDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Exercise List */}
            <ScrollArea className="flex-1 overflow-auto">
              <div className="space-y-4 py-4 px-6">
                <div className="flex items-center justify-between">
                  <p className="t6 font-semibold">
                    Exercises ({exercises.length})
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearWorkout}
                    className="h-8 text-muted-foreground hover:text-destructive"
                  >
                    Clear All
                  </Button>
                </div>

                {exercises.map((item) => (
                  <ExerciseFormItem
                    key={item.exercise.id}
                    data={item}
                    mode="edit"
                    onUpdate={(updates) =>
                      updateExercise(item.exercise.id, updates)
                    }
                    onRemove={() => removeExercise(item.exercise.id)}
                    showImage={true}
                  />
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Save Button */}
            <div className="px-6 py-4 flex-shrink-0 border-t">
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleSaveWorkout}
                disabled={!workoutName.trim() || exercises.length === 0}
                loading={createWorkout.isPending}
                loadingText="Saving..."
              >
                <Save className="h-4 w-4" />
                Save Workout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
