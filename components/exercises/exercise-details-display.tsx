"use client";

import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useState } from "react";
import { Dumbbell } from "lucide-react";
import type { Exercise } from "@prisma/client";

interface ExerciseDetailsDisplayProps {
  exercise: Exercise;
  showImage?: boolean;
  imageClassName?: string;
}

export function ExerciseDetailsDisplay({
  exercise,
  showImage = true,
  imageClassName = "h-[40vh] md:h-auto",
}: ExerciseDetailsDisplayProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <>
      {/* Image Section */}
      {showImage && (
        <div className={`relative w-full bg-muted ${imageClassName}`}>
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
              <Dumbbell className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {/* Details Section */}
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
                <Badge key={muscle} variant="outline" className="capitalize">
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
                <li key={index} className="p2 text-muted-foreground capitalize">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  );
}
