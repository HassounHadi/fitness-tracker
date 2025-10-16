"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Info } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export interface ExerciseCardProps {
  id: string;
  name: string;
  gifUrl: string;
  bodyPart: string;
  equipment: string;
  target: string;
  onViewDetails?: (id: string) => void;
}

export function ExerciseCard({
  id,
  name,
  gifUrl,
  bodyPart,
  equipment,
  target,
  onViewDetails,
}: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleViewDetails = () => {
    onViewDetails?.(id);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
      <CardContent className="p-0">
        {/* GIF Container */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {!imageError ? (
            <Image
              src={gifUrl}
              alt={name}
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
          <h3 className="t4 font-semibold capitalize line-clamp-2">{name}</h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {bodyPart}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {equipment}
            </Badge>
          </div>

          {/* Target Muscle */}
          <p className="p3 text-muted-foreground capitalize">
            Target:{" "}
            <span className="text-foreground font-medium">{target}</span>
          </p>

          {/* View Details Button */}
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={handleViewDetails}
          >
            <Info className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
