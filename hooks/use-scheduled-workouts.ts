import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ScheduledWorkout, WorkoutTemplate, TemplateExercise, Exercise } from "@prisma/client";

export type ScheduledWorkoutWithTemplate = ScheduledWorkout & {
  template: WorkoutTemplate & {
    exercises: (TemplateExercise & {
      exercise: Exercise;
    })[];
  };
};

export interface ScheduleWorkoutPayload {
  templateId: string;
  scheduledDate: string | Date;
}

export function useScheduledWorkouts(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ["scheduled-workouts", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const response = await api.get<ScheduledWorkoutWithTemplate[]>(
        `/api/scheduled-workouts?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        { showToast: false }
      );

      if (response.success && response.data) return response.data;

      throw new Error(response.message || "Failed to fetch scheduled workouts");
    },
  });
}

export function useScheduleWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ScheduleWorkoutPayload) => {
      const response = await api.post<ScheduledWorkoutWithTemplate>(
        "/api/scheduled-workouts",
        payload,
        { showToast: true }
      );

      if (response.success && response.data) return response.data;

      throw new Error(response.message || "Failed to schedule workout");
    },
    onSuccess: () => {
      // Invalidate scheduled workouts queries
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
    },
  });
}

export function useDeleteScheduledWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/scheduled-workouts?id=${id}`, {
        showToast: true,
      });

      if (response.success) return response;

      throw new Error(response.message || "Failed to delete scheduled workout");
    },
    onSuccess: () => {
      // Invalidate scheduled workouts queries
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
    },
  });
}
