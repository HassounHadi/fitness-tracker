"use client";
import { useState } from "react";
import { useWorkouts, type WorkoutWithExercises } from "@/hooks/use-workouts";
import { WorkoutCard } from "@/components/workouts/workout-card";
import { WorkoutDetailModal } from "@/components/workouts/workout-detail-modal";
import { EmptyState } from "@/components/common/empty-state";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WorkoutsPage() {
  const { data: workouts = [], isLoading, error } = useWorkouts();
  const [selectedWorkout, setSelectedWorkout] =
    useState<WorkoutWithExercises | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewWorkout = (id: string) => {
    const workout = workouts.find((w) => w.id === id);
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
      {!isLoading && !error && workouts.length === 0 && (
        <EmptyState
          icon={Sparkles}
          variant="featured"
          title="No Workouts Yet"
          description="Get started by generating your first AI-powered workout plan tailored to your goals and equipment."
          action={{
            label: "Generate Your First Workout",
            icon: Sparkles,
            href: "/workouts/generate",
            size: "lg",
          }}
        />
      )}

      {/* Workouts Grid */}
      {!isLoading && !error && workouts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
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
