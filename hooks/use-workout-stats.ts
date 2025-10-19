import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface WorkoutVolumeData {
  date: string;
  volume: number;
  sets: number;
  reps: number;
  duration: number;
  exerciseCount: number;
}

interface WorkoutStatsResponse {
  success: boolean;
  data: WorkoutVolumeData[];
}

export function useWorkoutStats(days: number = 30) {
  return useQuery({
    queryKey: ["workout-stats", days],
    queryFn: async () => {
      const response = await api.get<WorkoutVolumeData[]>(
        `/api/workout-stats?days=${days}`
      );
      console.log("Workout stats response:", response);
      console.log("Workout stats data:", response.data);
      // api-client already extracts data.data, so response.data is the array
      return response.data || [];
    },
  });
}
