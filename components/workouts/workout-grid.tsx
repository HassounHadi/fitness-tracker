import { WorkoutCard } from "@/components/workouts/workout-card";
import type { WorkoutWithExercises } from "@/hooks/use-workouts";

interface WorkoutGridProps {
  workouts: WorkoutWithExercises[];
  onSelectWorkout?: (workoutId: string) => void;
  selectable?: boolean;
}

export function WorkoutGrid({
  workouts,
  onSelectWorkout,
  selectable = false,
}: WorkoutGridProps) {
  const handleClick = (id: string) => {
    if (selectable && onSelectWorkout) {
      onSelectWorkout(id);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className={selectable ? "cursor-pointer" : ""}
          onClick={() => handleClick(workout.id)}
        >
          <WorkoutCard
            workout={workout}
            onView={selectable ? () => handleClick(workout.id) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
