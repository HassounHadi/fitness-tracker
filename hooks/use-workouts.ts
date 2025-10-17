import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { WorkoutTemplate, TemplateExercise, Exercise } from "@prisma/client";

export interface CreateWorkoutPayload {
  name: string;
  description?: string;
  isAiGenerated?: boolean;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    restTime: number;
    notes?: string;
  }[];
}

export interface GenerateAIWorkoutPayload {
  goal: string;
  duration: number;
  targetMuscles: string[];
  instructions?: string;
  exercises: {
    id: string;
    name: string;
  }[];
}

export interface AIWorkoutResponse {
  workoutName: string;
  workoutDescription: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    restTime: number;
    notes?: string;
  }[];
  totalDuration: number;
}

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

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateWorkoutPayload) => {
      const response = await api.post<WorkoutWithExercises>("/api/workouts", payload, {
        showToast: true,
      });

      if (response.success && response.data) return response.data;

      throw new Error(response.message || "Failed to create workout");
    },
    onSuccess: () => {
      // Invalidate and refetch workouts
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useGenerateAIWorkout() {
  return useMutation({
    mutationFn: async (payload: GenerateAIWorkoutPayload) => {
      const response = await api.post<AIWorkoutResponse>(
        "/api/gemini/workout-generator",
        payload,
        {
          showToast: false, // We'll handle errors in the component
        }
      );

      if (response.success && response.data) return response.data;

      throw new Error(response.message || "Failed to generate workout");
    },
    retry: false, // Don't retry on failure
  });
}
