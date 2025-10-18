import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

// ==================== Types ====================

export interface LoggedSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number | null;
  completed: boolean;
  createdAt: string;
}

export interface LoggedExercise {
  id: string;
  exerciseId: string;
  order: number;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    gifUrl: string;
    bodyPart: string;
    equipment: string;
    target: string;
    secondaryMuscles: string[];
    instructions: string[];
  };
  sets: LoggedSet[];
  createdAt: string;
}

export interface TemplateExercise {
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
    gifUrl: string;
    bodyPart: string;
    equipment: string;
    target: string;
    secondaryMuscles: string[];
    instructions: string[];
  };
  sets: number;
  reps: number;
  notes: string | null;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  templateId: string | null;
  date: string;
  name: string;
  duration: number | null;
  notes: string | null;
  completed: boolean;
  exercises: LoggedExercise[];
  templateExercises?: TemplateExercise[];
  createdAt: string;
  updatedAt: string;
}

// ==================== API Payloads ====================

export interface StartWorkoutPayload {
  scheduledWorkoutId: string;
}

export interface StartExercisePayload {
  workoutLogId: string;
  exerciseId: string;
  order: number;
  notes?: string;
}

export interface CreateSetPayload {
  loggedExerciseId: string;
  setNumber: number;
  reps: number;
  weight?: number | null;
}

export interface UpdateSetPayload {
  setId: string;
  reps: number;
  weight?: number | null;
  completed?: boolean;
}

export interface CompleteWorkoutPayload {
  workoutLogId: string;
  duration?: number;
  notes?: string;
}

// ==================== Hooks ====================

/**
 * Starts a workout from a scheduled workout
 * Creates a WorkoutLog and initializes LoggedExercises with sets
 */
export function useStartWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StartWorkoutPayload) => {
      try {
        const response = await api.post<WorkoutLog>(
          "/api/workout-logs/start",
          payload
        );

        // Check if the API call was actually successful
        if (!response.success) {
          console.error("API returned success=false:", response);
          throw new Error(response.message || "Failed to start workout");
        }

        return response.data;
      } catch (error) {
        console.error("ERROR in mutationFn:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate scheduled workouts to refresh calendar
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
    },
    onError: (error) => {
      console.error("MUTATION onError CALLED WITH:", error);
    },
  });
}

/**
 * Fetches a workout log by ID
 */
export function useWorkoutLog(workoutLogId: string | null) {
  return useQuery({
    queryKey: ["workout-log", workoutLogId],
    queryFn: async () => {
      if (!workoutLogId) return null;
      const response = await api.get<WorkoutLog>(
        `/api/workout-logs/${workoutLogId}`,
        { showToast: false }
      );
      return response.data;
    },
    enabled: !!workoutLogId,
  });
}

/**
 * Updates a set with reps and weight
 */
export function useUpdateSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateSetPayload) => {
      const response = await api.patch<LoggedSet>(
        "/api/workout-logs/sets",
        payload
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the workout log query to refresh
      // We don't know the workoutLogId here, so invalidate all workout-log queries
      queryClient.invalidateQueries({ queryKey: ["workout-log"] });
    },
  });
}

/**
 * Starts an exercise in the workout
 * Creates a LoggedExercise entry
 */
export function useStartExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StartExercisePayload) => {
      try {
        const response = await api.post<LoggedExercise>(
          "/api/workout-logs/exercise",
          payload
        );

        if (!response.success) {
          console.error(
            "START EXERCISE: API returned success=false:",
            response
          );
          throw new Error(response.message || "Failed to start exercise");
        }

        return response.data;
      } catch (error) {
        console.error("START EXERCISE: ERROR in mutationFn:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workout-log"] });
    },
    onError: (error) => {
      console.error("START EXERCISE: onError called with:", error);
    },
  });
}

/**
 * Creates a new logged set
 */
export function useCreateSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSetPayload) => {
      try {
        const response = await api.post<LoggedSet>(
          "/api/workout-logs/sets",
          payload
        );

        if (!response.success) {
          console.error("CREATE SET: API returned success=false:", response);
          throw new Error(response.message || "Failed to create set");
        }

        return response.data;
      } catch (error) {
        console.error("CREATE SET: ERROR in mutationFn:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workout-log"] });
    },
    onError: (error) => {
      console.error("CREATE SET: onError called with:", error);
    },
  });
}

/**
 * Completes a workout
 */
export function useCompleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CompleteWorkoutPayload) => {
      const response = await api.post<WorkoutLog>(
        "/api/workout-logs/complete",
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both workout logs and scheduled workouts
      queryClient.invalidateQueries({ queryKey: ["workout-log"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
    },
  });
}
