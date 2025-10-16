"use client";

import { useState, useMemo } from "react";
import { ExerciseFilters } from "@/components/exercises/exercise-filters";
import { ExerciseGrid } from "@/components/exercises/exercise-grid";
import { useExercises } from "@/hooks/use-exercises";

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Build filters object for React Query
  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      bodyPart: selectedBodyPart || undefined,
      equipment: selectedEquipment || undefined,
      target: selectedTarget || undefined,
    }),
    [searchQuery, selectedBodyPart, selectedEquipment, selectedTarget]
  );

  // Fetch exercises using React Query
  const { data: exercises = [], isLoading, error } = useExercises(filters);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBodyPart(null);
    setSelectedEquipment(null);
    setSelectedTarget(null);
  };

  const handleViewDetails = (id: string) => {
    console.log("View details:", id);
    // TODO: Navigate to exercise details page
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="t1">Exercise Library</h1>
        <p className="p1 text-muted-foreground mt-2">
          Browse and discover exercises for your workouts
        </p>
      </div>

      {/* Filters */}
      <ExerciseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBodyPart={selectedBodyPart}
        onBodyPartChange={setSelectedBodyPart}
        selectedEquipment={selectedEquipment}
        onEquipmentChange={setSelectedEquipment}
        selectedTarget={selectedTarget}
        onTargetChange={setSelectedTarget}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={clearFilters}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-error">Failed to load exercises</p>
        </div>
      )}

      {/* Exercise Grid */}
      {!isLoading && !error && (
        <ExerciseGrid
          exercises={exercises}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
}
