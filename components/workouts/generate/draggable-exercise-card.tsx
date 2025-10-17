"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GripVertical, Plus } from "lucide-react";
import type { Exercise } from "@prisma/client";
import { cn } from "@/lib/utils";

interface DraggableExerciseCardProps {
  exercise: Exercise;
  isDragging?: boolean;
}

export function DraggableExerciseCard({
  exercise,
  isDragging = false,
}: DraggableExerciseCardProps) {
  return (
    <Card
      className={cn(
        "p-3 hover:shadow-md transition-all cursor-move border-2 border-transparent hover:border-primary/30 active:scale-95",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div className="hidden lg:flex items-center text-muted-foreground">
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Mobile Add Icon */}
        <div className="lg:hidden flex items-center text-primary">
          <Plus className="h-5 w-5" />
        </div>

        {/* Exercise Info */}
        <div className="flex-1 min-w-0">
          <p className="t6 capitalize text-primary line-clamp-1">
            {exercise.name}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            <Badge variant="secondary" className="text-xs capitalize">
              {exercise.bodyPart}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {exercise.equipment}
            </Badge>
          </div>
        </div>

        {/* Target Badge */}
        <div className="hidden sm:block">
          <Badge variant="default" className="capitalize text-xs">
            {exercise.target}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
