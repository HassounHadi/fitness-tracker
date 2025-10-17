"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExercise } from "@/hooks/use-exercises";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseDetailsDisplay } from "./exercise-details-display";

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
            <div className="relative w-full md:w-1/2 h-[40vh] md:h-auto">
              <ExerciseDetailsDisplay
                exercise={exercise}
                showImage={true}
                imageClassName="h-[40vh] md:h-full"
              />

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

              <ExerciseDetailsDisplay
                exercise={exercise}
                showImage={false}
              />
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
