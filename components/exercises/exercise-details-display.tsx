"use client";

import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
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
  return (
    <>
      {/* Image Section */}
      {showImage && (
        <ImageWithFallback
          src={exercise.gifUrl}
          alt={exercise.name}
          containerClassName={imageClassName}
          imageClassName="p-4"
          objectFit="contain"
          unoptimized
        />
      )}

      {/* Details Section */}
      <div className="space-y-6">
        {/* Exercise Info */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h4 className="t5 font-semibold mb-2 text-primary">Body Part</h4>
            <Badge variant="default" className="capitalize">
              {exercise.bodyPart}
            </Badge>
          </div>

          <div>
            <h4 className="t5 font-semibold mb-2 text-primary">Equipment</h4>
            <Badge variant="secondary" className="capitalize">
              {exercise.equipment}
            </Badge>
          </div>

          <div>
            <h4 className="t5 font-semibold mb-2 text-primary">Target Muscle</h4>
            <Badge variant="outline" className="capitalize">
              {exercise.target}
            </Badge>
          </div>
        </div>

        {/* Secondary Muscles */}
        {exercise.secondaryMuscles.length > 0 && (
          <div>
            <h4 className="t5 font-semibold mb-2 text-primary">Secondary Muscles</h4>
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
            <h4 className="t5 font-semibold mb-3 text-primary">Instructions</h4>
            <ol className="space-y-3 list-decimal list-inside">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="p2 text-accent capitalize">
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
