"use client";

import { useState } from "react";
import { ExerciseFilters } from "@/components/exercises/exercise-filters";
import { ExerciseGrid, Exercise } from "@/components/exercises/exercise-grid";

// Mock data - will be replaced with API call
const mockExercises: Exercise[] = [
  {
    id: "1",
    name: "3/4 sit-up",
    gifUrl: "https://v2.exercisedb.io/image/0001",
    bodyPart: "waist",
    equipment: "body weight",
    target: "abs",
  },
  {
    id: "2",
    name: "45° side bend",
    gifUrl: "https://v2.exercisedb.io/image/0002",
    bodyPart: "waist",
    equipment: "body weight",
    target: "abs",
  },
  {
    id: "3",
    name: "air bike",
    gifUrl: "https://v2.exercisedb.io/image/0003",
    bodyPart: "waist",
    equipment: "body weight",
    target: "abs",
  },
  {
    id: "7",
    name: "alternate lateral pulldown",
    gifUrl: "https://v2.exercisedb.io/image/0007",
    bodyPart: "back",
    equipment: "cable",
    target: "lats",
  },
  {
    id: "9",
    name: "assisted chest dip (kneeling)",
    gifUrl: "https://v2.exercisedb.io/image/0009",
    bodyPart: "chest",
    equipment: "leverage machine",
    target: "pectorals",
  },
];

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

      {/* Exercise Grid */}
      <ExerciseGrid
        exercises={mockExercises}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
