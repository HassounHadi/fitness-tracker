import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Zap } from "lucide-react";
import type { WorkoutWithExercises } from "@/hooks/use-workouts";

interface WorkoutCardProps {
  workout: WorkoutWithExercises;
  onView: (id: string) => void;
}

export function WorkoutCard({ workout, onView }: WorkoutCardProps) {
  const totalExercises = workout.exercises.length;
  const totalSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets,
    0
  );

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="t4 capitalize flex items-center gap-2 text-primary">
              {workout.isAiGenerated && (
                <Zap className="h-4 w-4 text-accent fill-accent" />
              )}
              {workout.name}
            </CardTitle>
            {workout.description && (
              <p className="text-sm text-accent mt-1">
                {workout.description}
              </p>
            )}
          </div>
          {workout.isAiGenerated && (
            <Badge variant="secondary" className="shrink-0">
              AI Generated
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-4">
        {/* Workout Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4 text-primary" />
            <span className="font-medium">{totalExercises}</span>
            <span className="text-muted-foreground">
              {totalExercises === 1 ? "Exercise" : "Exercises"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{totalSets}</span>
            <span className="text-muted-foreground">
              {totalSets === 1 ? "Set" : "Sets"}
            </span>
          </div>
        </div>

        {/* Exercise List Preview */}
        {workout.exercises.length > 0 && (
          <div className="space-y-1 flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Exercises:
            </p>
            <div className="flex flex-wrap gap-1">
              {workout.exercises.slice(0, 3).map((ex) => (
                <Badge key={ex.id} variant="outline" className="text-xs capitalize">
                  {ex.exercise.name}
                </Badge>
              ))}
              {workout.exercises.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{workout.exercises.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="secondary"
          className="w-full mt-auto"
          onClick={() => onView(workout.id)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
