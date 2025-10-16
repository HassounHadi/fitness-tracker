"use client";

import { useWorkoutBuilder } from "@/contexts/workout-builder-context";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WorkoutBuilderFAB() {
  const { exercises, openSidebar } = useWorkoutBuilder();

  if (exercises.length === 0) return null;

  return (
    <Button
      onClick={openSidebar}
      size="lg"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl p-0"
    >
      <div className="relative">
        <Dumbbell className="h-6 w-6" />
        {exercises.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {exercises.length}
          </Badge>
        )}
      </div>
    </Button>
  );
}
