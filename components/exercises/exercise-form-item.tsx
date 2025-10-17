"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import type { Exercise } from "@prisma/client";

export interface ExerciseFormData {
  exercise: Exercise;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
}

interface ExerciseFormItemProps {
  data: ExerciseFormData;
  mode: "edit" | "view";
  onUpdate?: (updates: Partial<Omit<ExerciseFormData, "exercise">>) => void;
  onRemove?: () => void;
  showImage?: boolean;
  compact?: boolean;
}

export function ExerciseFormItem({
  data,
  mode,
  onUpdate,
  onRemove,
  showImage = true,
  compact = false,
}: ExerciseFormItemProps) {
  const { exercise, sets, reps, restTime, notes } = data;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Exercise Header */}
      <div className="flex gap-3">
        {showImage && (
          <ImageWithFallback
            src={exercise.gifUrl}
            alt={exercise.name}
            containerClassName="w-16 h-16 rounded overflow-hidden flex-shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="t6 capitalize line-clamp-2">{exercise.name}</h4>
            {mode === "edit" && onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            <Badge variant="secondary" className="text-xs capitalize">
              {exercise.bodyPart}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {exercise.target}
            </Badge>
          </div>
        </div>
      </div>

      {/* Exercise Parameters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`sets-${exercise.id}`} className="text-xs">
            Sets
          </Label>
          {mode === "edit" ? (
            <Input
              id={`sets-${exercise.id}`}
              type="number"
              min="1"
              value={sets}
              onChange={(e) =>
                onUpdate?.({ sets: parseInt(e.target.value) || 1 })
              }
              className="h-9"
            />
          ) : (
            <div className="h-9 px-3 py-2 border rounded-md bg-muted flex items-center text-sm">
              {sets}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor={`reps-${exercise.id}`} className="text-xs">
            Reps
          </Label>
          {mode === "edit" ? (
            <Input
              id={`reps-${exercise.id}`}
              type="number"
              min="1"
              value={reps}
              onChange={(e) =>
                onUpdate?.({ reps: parseInt(e.target.value) || 1 })
              }
              className="h-9"
            />
          ) : (
            <div className="h-9 px-3 py-2 border rounded-md bg-muted flex items-center text-sm">
              {reps}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor={`rest-${exercise.id}`} className="text-xs">
            Rest (s)
          </Label>
          {mode === "edit" ? (
            <Input
              id={`rest-${exercise.id}`}
              type="number"
              min="0"
              step="15"
              value={restTime}
              onChange={(e) =>
                onUpdate?.({ restTime: parseInt(e.target.value) || 0 })
              }
              className="h-9"
            />
          ) : (
            <div className="h-9 px-3 py-2 border rounded-md bg-muted flex items-center text-sm">
              {restTime}s
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {(mode === "edit" || notes) && (
        <div className="space-y-1">
          <Label htmlFor={`notes-${exercise.id}`} className="text-xs">
            Notes {mode === "view" && !notes ? "" : "(optional)"}
          </Label>
          {mode === "edit" ? (
            <Textarea
              id={`notes-${exercise.id}`}
              placeholder="Add notes for this exercise..."
              value={notes || ""}
              onChange={(e) => onUpdate?.({ notes: e.target.value })}
              rows={2}
              className="resize-none text-sm"
            />
          ) : notes ? (
            <div className="px-3 py-2 border rounded-md bg-muted text-sm">
              {notes}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
