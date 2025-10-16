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
import { Badge } from "@/components/ui/badge";
import { X, Save, Dumbbell } from "lucide-react";
import Image from "next/image";

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
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

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

  const handleImageError = (exerciseId: string) => {
    setImageError((prev) => ({ ...prev, [exerciseId]: true }));
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
                  <div
                    key={item.exercise.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    {/* Exercise Header */}
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                        {!imageError[item.exercise.id] ? (
                          <Image
                            src={item.exercise.gifUrl}
                            alt={item.exercise.name}
                            fill
                            className="object-cover"
                            onError={() => handleImageError(item.exercise.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Dumbbell className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="t6 capitalize line-clamp-2">
                            {item.exercise.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => removeExercise(item.exercise.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {item.exercise.bodyPart}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {item.exercise.target}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Exercise Parameters */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label
                          htmlFor={`sets-${item.exercise.id}`}
                          className="text-xs"
                        >
                          Sets
                        </Label>
                        <Input
                          id={`sets-${item.exercise.id}`}
                          type="number"
                          min="1"
                          value={item.sets}
                          onChange={(e) =>
                            updateExercise(item.exercise.id, {
                              sets: parseInt(e.target.value) || 1,
                            })
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor={`reps-${item.exercise.id}`}
                          className="text-xs"
                        >
                          Reps
                        </Label>
                        <Input
                          id={`reps-${item.exercise.id}`}
                          type="number"
                          min="1"
                          value={item.reps}
                          onChange={(e) =>
                            updateExercise(item.exercise.id, {
                              reps: parseInt(e.target.value) || 1,
                            })
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor={`rest-${item.exercise.id}`}
                          className="text-xs"
                        >
                          Rest (s)
                        </Label>
                        <Input
                          id={`rest-${item.exercise.id}`}
                          type="number"
                          min="0"
                          step="15"
                          value={item.restTime}
                          onChange={(e) =>
                            updateExercise(item.exercise.id, {
                              restTime: parseInt(e.target.value) || 0,
                            })
                          }
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <Label
                        htmlFor={`notes-${item.exercise.id}`}
                        className="text-xs"
                      >
                        Notes (optional)
                      </Label>
                      <Textarea
                        id={`notes-${item.exercise.id}`}
                        placeholder="Add notes for this exercise..."
                        value={item.notes || ""}
                        onChange={(e) =>
                          updateExercise(item.exercise.id, {
                            notes: e.target.value,
                          })
                        }
                        rows={2}
                        className="resize-none text-sm"
                      />
                    </div>
                  </div>
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
