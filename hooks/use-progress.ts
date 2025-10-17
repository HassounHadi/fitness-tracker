import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

// ==================== Types ====================

export interface ProgressLog {
  id: string;
  userId: string;
  date: string;
  weight: number | null;
  bodyFat: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  biceps: number | null;
  thighs: number | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateProgressLogPayload {
  date?: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  photoUrl?: string;
  notes?: string;
}

// ==================== Hooks ====================

/**
 * Fetches progress logs for a date range
 * If no dates provided, fetches all logs
 */
export function useProgressLogs(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: [
      "progress-logs",
      startDate?.toISOString(),
      endDate?.toISOString(),
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());

      const url = `/api/progress${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      return data as ProgressLog[];
    },
  });
}

/**
 * Fetches the latest progress log
 */
export function useLatestProgress() {
  return useQuery({
    queryKey: ["progress-logs", "latest"],
    queryFn: async () => {
      const res = await fetch("/api/progress");
      const data = await res.json();
      return (data[0] || null) as ProgressLog | null; // Returns first (latest) or null
    },
  });
}

/**
 * Creates or updates a progress log
 */
export function useCreateProgressLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProgressLogPayload) => {
      const response = await api.post<ProgressLog>("/api/progress", payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all progress queries to refetch
      queryClient.invalidateQueries({ queryKey: ["progress-logs"] });
    },
  });
}
