"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useExercise } from "@/hooks/use-exercises";
import Image from "next/image";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExerciseDetailModalProps {
  exerciseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExerciseDetailModal({
  exerciseId,
  open,
  onOpenChange,
}: ExerciseDetailModalProps) {
  const { data: exercise, isLoading } = useExercise(exerciseId || "");
  const [imageError, setImageError] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" !max-w-screen sm:!max-w-[80vw] !h-screen sm:max-h-[90vh] p-0 gap-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin size-10 text-primary" />
          </div>
        ) : exercise ? (
          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Side - Image (Full screen on mobile, side-by-side on desktop) */}
            <div className="relative w-full md:w-1/2 h-[40vh] md:h-auto bg-muted">
              {!imageError ? (
                <Image
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  fill
                  className="object-contain p-4"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Image not available</p>
                </div>
              )}

              {/* Mobile Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 md:hidden bg-background/80 hover:bg-background"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Right Side - Details (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="t3 capitalize pr-8">
                  {exercise.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Exercise Info */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="t5 font-semibold mb-2">Body Part</h4>
                    <Badge variant="default" className="capitalize">
                      {exercise.bodyPart}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="t5 font-semibold mb-2">Equipment</h4>
                    <Badge variant="secondary" className="capitalize">
                      {exercise.equipment}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="t5 font-semibold mb-2">Target Muscle</h4>
                    <Badge variant="outline" className="capitalize">
                      {exercise.target}
                    </Badge>
                  </div>
                </div>

                {/* Secondary Muscles */}
                {exercise.secondaryMuscles.length > 0 && (
                  <div>
                    <h4 className="t5 font-semibold mb-2">Secondary Muscles</h4>
                    <div className="flex flex-wrap gap-2">
                      {exercise.secondaryMuscles.map((muscle) => (
                        <Badge
                          key={muscle}
                          variant="outline"
                          className="capitalize"
                        >
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {exercise.instructions.length > 0 && (
                  <div>
                    <h4 className="t5 font-semibold mb-3">Instructions</h4>
                    <ol className="space-y-3 list-decimal list-inside">
                      {exercise.instructions.map((instruction, index) => (
                        <li
                          key={index}
                          className="p2 text-muted-foreground capitalize"
                        >
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Exercise not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
