"use client";
import { useState } from "react";
import { useWorkouts, type WorkoutWithExercises } from "@/hooks/use-workouts";
import { WorkoutCard } from "@/components/workouts/workout-card";
import { WorkoutDetailModal } from "@/components/workouts/workout-detail-modal";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

// TEMPORARY: Mock data for UI preview
const MOCK_DATA: WorkoutWithExercises[] = [
  {
    id: "1",
    userId: "mock",
    name: "Full Body Strength",
    description: "A comprehensive full-body workout focusing on compound movements",
    isAiGenerated: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    exercises: Array(5).fill(null).map((_, i) => ({
      id: `ex-${i}`,
      templateId: "1",
      exerciseId: `e${i}`,
      order: i + 1,
      sets: 3,
      reps: 12,
      restTime: 90,
      notes: null,
      createdAt: new Date(),
      exercise: {
        id: `e${i}`,
        apiId: `00${i}`,
        name: ["squat", "bench press", "deadlift", "rows", "planks"][i],
        gifUrl: "",
        bodyPart: "full body",
        equipment: "barbell",
        target: "mixed",
        secondaryMuscles: [],
        instructions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })),
  },
  {
    id: "2",
    userId: "mock",
    name: "Upper Body Power",
    description: "Intense upper body workout for building strength and size",
    isAiGenerated: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    exercises: Array(4).fill(null).map((_, i) => ({
      id: `ex2-${i}`,
      templateId: "2",
      exerciseId: `e2${i}`,
      order: i + 1,
      sets: 4,
      reps: 8,
      restTime: 120,
      notes: null,
      createdAt: new Date(),
      exercise: {
        id: `e2${i}`,
        apiId: `10${i}`,
        name: ["overhead press", "pull-ups", "dips", "curls"][i],
        gifUrl: "",
        bodyPart: "upper",
        equipment: "barbell",
        target: "mixed",
        secondaryMuscles: [],
        instructions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })),
  },
  {
    id: "3",
    userId: "mock",
    name: "Core & Conditioning",
    description: "High-intensity core workout with cardio elements",
    isAiGenerated: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    exercises: Array(3).fill(null).map((_, i) => ({
      id: `ex3-${i}`,
      templateId: "3",
      exerciseId: `e3${i}`,
      order: i + 1,
      sets: 3,
      reps: 20,
      restTime: 45,
      notes: null,
      createdAt: new Date(),
      exercise: {
        id: `e3${i}`,
        apiId: `20${i}`,
        name: ["mountain climbers", "russian twists", "bicycle crunches"][i],
        gifUrl: "",
        bodyPart: "core",
        equipment: "body weight",
        target: "abs",
        secondaryMuscles: [],
        instructions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })),
  },
  {
    id: "4",
    userId: "mock",
    name: "Leg Day Destroyer",
    description: "Complete lower body workout targeting all major leg muscles",
    isAiGenerated: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    exercises: Array(5).fill(null).map((_, i) => ({
      id: `ex4-${i}`,
      templateId: "4",
      exerciseId: `e4${i}`,
      order: i + 1,
      sets: 4,
      reps: 10,
      restTime: 180,
      notes: null,
      createdAt: new Date(),
      exercise: {
        id: `e4${i}`,
        apiId: `30${i}`,
        name: ["front squat", "leg press", "lunges", "leg curls", "calf raises"][i],
        gifUrl: "",
        bodyPart: "legs",
        equipment: "barbell",
        target: "quads",
        secondaryMuscles: [],
        instructions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })),
  },
  {
    id: "5",
    userId: "mock",
    name: "Quick Morning Workout",
    description: "Perfect 20-minute routine to start your day energized",
    isAiGenerated: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    exercises: Array(3).fill(null).map((_, i) => ({
      id: `ex5-${i}`,
      templateId: "5",
      exerciseId: `e5${i}`,
      order: i + 1,
      sets: 2,
      reps: 15,
      restTime: 30,
      notes: null,
      createdAt: new Date(),
      exercise: {
        id: `e5${i}`,
        apiId: `40${i}`,
        name: ["push-ups", "squats", "jumping jacks"][i],
        gifUrl: "",
        bodyPart: "full body",
        equipment: "body weight",
        target: "mixed",
        secondaryMuscles: [],
        instructions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })),
  },
];

export default function WorkoutsPage() {
  const { data: workouts = [], isLoading, error } = useWorkouts();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithExercises | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Use mock data for preview (remove this line later)
  const displayWorkouts = workouts.length > 0 ? workouts : MOCK_DATA;

  const handleViewWorkout = (id: string) => {
    const workout = displayWorkouts.find((w) => w.id === id);
    if (workout) {
      setSelectedWorkout(workout);
      setModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="t1 text-primary">My Workouts</h1>
          <p className="p1 text-accent mt-2">
            View and manage your workout routines
          </p>
        </div>

        {/* AI Generator CTA */}
        <Link href="/workouts/generate">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate AI Workout
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {!isLoading && !error && displayWorkouts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="relative bg-primary/10 p-6 rounded-full">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h2 className="t3 mb-2">No Workouts Yet</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Get started by generating your first AI-powered workout plan
            tailored to your goals and equipment.
          </p>

          <Link href="/workouts/generate">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Your First Workout
            </Button>
          </Link>
        </div>
      )}

      {/* Workouts Grid */}
      {!isLoading && !error && displayWorkouts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onView={handleViewWorkout}
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-error">Failed to load workouts</p>
        </div>
      )}

      {/* Workout Detail Modal */}
      <WorkoutDetailModal
        workout={selectedWorkout}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
