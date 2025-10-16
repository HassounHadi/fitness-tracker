import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { WorkoutTemplate, TemplateExercise, Exercise } from "@prisma/client";

export type WorkoutWithExercises = WorkoutTemplate & {
  exercises: (TemplateExercise & {
    exercise: Exercise;
  })[];
};

export function useWorkouts() {
  return useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      const response = await api.get<WorkoutWithExercises[]>("/api/workouts", {
        showToast: false,
      });

      if (response.success && response.data) return response.data;

      throw new Error(response.message || "Failed to fetch workouts");
    },
  });
}
