import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Exercise {
  id: string;
  name: string;
  gifUrl: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

export interface ExerciseFilters {
  search?: string;
  bodyPart?: string;
  equipment?: string;
  target?: string;
}

export interface ExerciseFilterOptions {
  bodyParts: string[];
  equipments: string[];
  targets: string[];
}

// Fetch all exercises with optional filters
export function useExercises(filters?: ExerciseFilters) {
  return useQuery({
    queryKey: ["exercises", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.bodyPart) params.append("bodyPart", filters.bodyPart);
      if (filters?.equipment) params.append("equipment", filters.equipment);
      if (filters?.target) params.append("target", filters.target);

      const response = await api.get<Exercise[]>(
        `/api/exercises?${params.toString()}`,
        { showToast: false }
      );

      if (response.success && response.data) return response.data;

      throw new Error(response.message || "Failed to fetch exercises");
    },
  });
}

// Fetch single exercise by ID
export function useExercise(id: string) {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: async () => {
      const response = await api.get<Exercise>(`/api/exercises/${id}`, {
        showToast: false,
      });

      if (response.success && response.data) return response.data;

      throw new Error(response.message || "Failed to fetch exercise");
    },
    enabled: !!id,
  });
}

// Fetch available filter options
export function useExerciseFilters() {
  return useQuery({
    queryKey: ["exercise-filters"],
    queryFn: async () => {
      const response = await api.get<ExerciseFilterOptions>(
        "/api/exercises/filters",
        { showToast: false }
      );

      if (response.success && response.data) return response.data;

      throw new Error(response.message || "Failed to fetch filters");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - filters don't change often
  });
}
