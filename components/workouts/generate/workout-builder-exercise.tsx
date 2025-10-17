"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  GripVertical,
  X,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import type { Exercise } from "@prisma/client";
import { cn } from "@/lib/utils";

interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
}

interface WorkoutBuilderExerciseProps {
  exercise: WorkoutExercise;
  index: number;
  onUpdate: (updates: Partial<Omit<WorkoutExercise, "id" | "exercise">>) => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, dropIndex: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export function WorkoutBuilderExercise({
  exercise,
  index,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}: WorkoutBuilderExerciseProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={cn(
        "overflow-hidden border-2 border-border hover:border-primary/30 transition-all cursor-move",
        isDragging && "opacity-50 scale-95"
      )}
    >
      {/* Collapsed View */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div className="flex items-center text-muted-foreground cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Exercise Thumbnail */}
          <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-muted">
            <ImageWithFallback
              src={exercise.exercise.gifUrl}
              alt={exercise.exercise.name}
              containerClassName="w-full h-full"
              objectFit="cover"
              unoptimized
            />
          </div>

          {/* Exercise Info */}
          <div className="flex-1 min-w-0">
            <p className="t6 capitalize text-primary line-clamp-1">
              {exercise.exercise.name}
            </p>
            <p className="p3 text-accent">
              {exercise.sets} × {exercise.reps} | {exercise.restTime}s rest
            </p>
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-error hover:text-error"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4 bg-muted/30">
          {/* Exercise Details */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="capitalize">
              {exercise.exercise.bodyPart}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {exercise.exercise.equipment}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {exercise.exercise.target}
            </Badge>
          </div>

          {/* Sets, Reps, Rest Time */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor={`sets-${exercise.id}`} className="text-xs">
                Sets
              </Label>
              <Input
                id={`sets-${exercise.id}`}
                type="number"
                min="1"
                max="10"
                value={exercise.sets}
                onChange={(e) =>
                  onUpdate({ sets: parseInt(e.target.value) || 1 })
                }
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor={`reps-${exercise.id}`} className="text-xs">
                Reps
              </Label>
              <Input
                id={`reps-${exercise.id}`}
                type="number"
                min="1"
                max="100"
                value={exercise.reps}
                onChange={(e) =>
                  onUpdate({ reps: parseInt(e.target.value) || 1 })
                }
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor={`rest-${exercise.id}`} className="text-xs">
                Rest (s)
              </Label>
              <Input
                id={`rest-${exercise.id}`}
                type="number"
                min="0"
                max="600"
                step="15"
                value={exercise.restTime}
                onChange={(e) =>
                  onUpdate({ restTime: parseInt(e.target.value) || 0 })
                }
                className="h-9"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor={`notes-${exercise.id}`} className="text-xs">
              Notes (Optional)
            </Label>
            <Textarea
              id={`notes-${exercise.id}`}
              placeholder="Add notes about form, tempo, or variations..."
              value={exercise.notes || ""}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate({ sets: exercise.sets + 1 })}
            >
              + Set
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate({ reps: exercise.reps + 1 })}
            >
              + Rep
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate({ restTime: exercise.restTime + 15 })}
            >
              + 15s
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
