"use client";

import { useState, useMemo } from "react";
import { ExerciseFilters } from "@/components/exercises/exercise-filters";
import { ExerciseGrid } from "@/components/exercises/exercise-grid";
import { ExerciseDetailModal } from "@/components/exercises/exercise-detail-modal";
import { useExercises } from "@/hooks/use-exercises";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2 } from "lucide-react";

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build filters object for React Query
  const filters = useMemo(
    () => ({
      search: debouncedSearchQuery || undefined,
      bodyPart: selectedBodyPart || undefined,
      equipment: selectedEquipment || undefined,
      target: selectedTarget || undefined,
    }),
    [debouncedSearchQuery, selectedBodyPart, selectedEquipment, selectedTarget]
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
    setSelectedExerciseId(id);
    setIsModalOpen(true);
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
          <Loader2 className="h-20 w-20 animate-spin text-primary" />
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
        <ExerciseGrid exercises={exercises} onViewDetails={handleViewDetails} />
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exerciseId={selectedExerciseId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
