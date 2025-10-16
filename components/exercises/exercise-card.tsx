"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Plus, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useWorkoutBuilder } from "@/contexts/workout-builder-context";
import type { Exercise } from "@prisma/client";

export interface ExerciseCardProps {
  exercise: Exercise;
  onViewDetails?: (id: string) => void;
}

export function ExerciseCard({
  exercise,
  onViewDetails,
}: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);
  const { exercises, addExercise } = useWorkoutBuilder();

  const isInWorkout = exercises.some((item) => item.exercise.id === exercise.id);

  const handleViewDetails = () => {
    onViewDetails?.(exercise.id);
  };

  const handleAddToWorkout = () => {
    addExercise(exercise);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 py-0">
      <CardContent className="p-0">
        {/* GIF Container */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {!imageError ? (
            <Image
              src={exercise.gifUrl}
              alt={exercise.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <p className="text-muted-foreground p3">Image unavailable</p>
            </div>
          )}
        </div>

        {/* Exercise Info */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="t4 text-primary font-semibold capitalize line-clamp-2">
            {exercise.name}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {exercise.bodyPart}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {exercise.equipment}
            </Badge>
          </div>

          {/* Target Muscle */}
          <p className="p3 text-muted-foreground capitalize">
            Target:{" "}
            <span className="text-foreground font-medium">{exercise.target}</span>
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 gap-2"
              onClick={handleViewDetails}
            >
              <Info className="h-4 w-4" />
              Details
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleAddToWorkout}
              disabled={isInWorkout}
            >
              {isInWorkout ? (
                <>
                  <Check className="h-4 w-4" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
