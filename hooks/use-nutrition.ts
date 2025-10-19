import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ==================== Types ====================

export interface NutritionLog {
  id: string;
  userId: string;
  date: string;
  mealName: string | null;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

export interface CreateNutritionLogPayload {
  mealName?: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date?: string;
}

export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

export interface NutritionGoals {
  dailyCalorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

export interface NutritionSummaryResponse {
  summary: NutritionSummary;
  goals: NutritionGoals;
  logs: NutritionLog[];
}

// ==================== Hooks ====================

/**
 * Fetches nutrition logs for a date range
 * If no dates provided, fetches all logs
 */
export function useNutritionLogs(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: [
      "nutrition-logs",
      startDate?.toISOString(),
      endDate?.toISOString(),
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());

      const url = `/api/nutrition${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      return data as NutritionLog[];
    },
  });
}

/**
 * Fetches today's nutrition logs and calculates summary
 */
export function useTodaysNutrition() {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  return useQuery({
    queryKey: ["nutrition-logs", "today"],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: startOfToday.toISOString(),
        endDate: endOfToday.toISOString(),
      });

      const res = await fetch(`/api/nutrition?${params.toString()}`);
      const logs = (await res.json()) as NutritionLog[];

      // Calculate summary
      const summary: NutritionSummary = logs.reduce(
        (acc, log) => ({
          totalCalories: acc.totalCalories + log.calories,
          totalProtein: acc.totalProtein + log.protein,
          totalCarbs: acc.totalCarbs + log.carbs,
          totalFat: acc.totalFat + log.fat,
          mealCount: acc.mealCount + 1,
        }),
        {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          mealCount: 0,
        }
      );

      return { logs, summary };
    },
  });
}

/**
 * Fetches today's nutrition summary along with user's nutrition goals from database
 */
export function useNutritionSummaryWithGoals() {
  return useQuery({
    queryKey: ["nutrition-summary", "today"],
    queryFn: async () => {
      const res = await fetch("/api/nutrition/summary");
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch nutrition summary");
      }

      return data.data as NutritionSummaryResponse;
    },
  });
}

/**
 * Creates a nutrition log
 */
export function useCreateNutritionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateNutritionLogPayload) => {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create nutrition log");
      }

      return res.json() as Promise<NutritionLog>;
    },
    onSuccess: () => {
      // Invalidate all nutrition queries to refetch
      queryClient.invalidateQueries({ queryKey: ["nutrition-logs"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-summary"] });
    },
  });
}
