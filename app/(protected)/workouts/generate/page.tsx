"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, GripVertical, Dumbbell } from "lucide-react";
import { useExercises } from "@/hooks/use-exercises";
import { useDebounce } from "@/hooks/use-debounce";
import { useWorkoutBuilder } from "@/hooks/use-workout-builder";
import { useCreateWorkout, useGenerateAIWorkout } from "@/hooks/use-workouts";
import { WorkoutExerciseLibrary } from "@/components/workouts/generate/workout-exercise-library";
import { WorkoutBuilderColumn } from "@/components/workouts/generate/workout-builder-column";
import { AIGeneratorColumn } from "@/components/workouts/generate/ai-generator-column";
import type { Exercise } from "@prisma/client";

export default function GenerateWorkoutPage() {
  // Exercise Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Workout Builder Hook
  const {
    workoutName,
    workoutDescription,
    workoutExercises,
    removedExerciseIds,
    draggedWorkoutIndex,
    setWorkoutName,
    setWorkoutDescription,
    setDraggedWorkoutIndex,
    addExercise,
    removeExercise,
    updateExercise,
    reorderExercises,
    clearWorkout,
  } = useWorkoutBuilder();

  // AI Form State
  const [aiGoal, setAiGoal] = useState("");
  const [aiDuration, setAiDuration] = useState("");
  const [aiTargetMuscles, setAiTargetMuscles] = useState<string[]>([]);
  const [aiInstructions, setAiInstructions] = useState("");

  // Mutations
  const createWorkoutMutation = useCreateWorkout();
  const generateAIWorkoutMutation = useGenerateAIWorkout();

  // Mobile View State
  const [mobileView, setMobileView] = useState<"exercises" | "workout" | "ai">(
    "exercises"
  );

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build filters object
  const filters = useMemo(
    () => ({
      search: debouncedSearchQuery || undefined,
      bodyPart: selectedBodyPart || undefined,
      equipment: selectedEquipment || undefined,
      target: selectedTarget || undefined,
    }),
    [debouncedSearchQuery, selectedBodyPart, selectedEquipment, selectedTarget]
  );

  // Fetch exercises
  const { data: exercisesData = [], isLoading, error } = useExercises(filters);

  // Filter out exercises that have been added to the workout
  const exercises = useMemo(() => {
    return exercisesData.filter((ex) => !removedExerciseIds.includes(ex.id));
  }, [exercisesData, removedExerciseIds]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBodyPart(null);
    setSelectedEquipment(null);
    setSelectedTarget(null);
  };

  // Drag and Drop Handlers
  const handleLibraryDragStart = (e: React.DragEvent, exercise: Exercise) => {
    e.dataTransfer.setData("type", "library");
    e.dataTransfer.setData("exercise", JSON.stringify(exercise));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleWorkoutDragStart = (e: React.DragEvent, index: number) => {
    setDraggedWorkoutIndex(index);
    e.dataTransfer.setData("type", "workout");
    e.dataTransfer.setData("index", index.toString());
    e.dataTransfer.setData(
      "workoutExercise",
      JSON.stringify(workoutExercises[index])
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleWorkoutDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleWorkoutDrop = (e: React.DragEvent, dropIndex?: number) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");

    if (type === "library") {
      const exerciseData = e.dataTransfer.getData("exercise");
      if (exerciseData) {
        const exercise = JSON.parse(exerciseData) as Exercise;
        addExercise(exercise, dropIndex);
      }
    } else if (type === "workout" && dropIndex !== undefined) {
      const dragIndex = parseInt(e.dataTransfer.getData("index"));
      if (!isNaN(dragIndex) && dragIndex !== dropIndex) {
        reorderExercises(dragIndex, dropIndex);
      }
    }

    setDraggedWorkoutIndex(null);
  };

  const handleWorkoutDragEnd = () => {
    setDraggedWorkoutIndex(null);
  };

  const handleLibraryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleLibraryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");

    if (type === "workout") {
      const workoutExerciseData = e.dataTransfer.getData("workoutExercise");
      if (workoutExerciseData) {
        const workoutExercise = JSON.parse(workoutExerciseData);
        removeExercise(workoutExercise.id);
      }
    }

    setDraggedWorkoutIndex(null);
  };

  const handleSaveWorkout = async () => {
    // Validate workout has required fields
    if (!workoutName.trim()) {
      toast.error("Please enter a workout name");
      return;
    }

    if (workoutExercises.length === 0) {
      toast.error("Please add at least one exercise to your workout");
      return;
    }

    try {
      await createWorkoutMutation.mutateAsync({
        name: workoutName,
        description: workoutDescription || undefined,
        isAiGenerated: true, // All workouts from this page are AI-generated
        exercises: workoutExercises.map((we) => ({
          exerciseId: we.exercise.id,
          sets: we.sets,
          reps: we.reps,
          restTime: we.restTime,
          notes: we.notes,
        })),
      });

      // Clear the workout builder on success
      clearWorkout();
    } catch (error) {
      console.error("Failed to save workout:", error);
      // Error toast is already shown by the mutation
    }
  };

  const handleGenerateAI = () => {
    // Prepare minimal exercise data (only ID and name)
    const exerciseReferences = exercisesData.map((ex) => ({
      id: ex.id,
      name: ex.name,
    }));

    generateAIWorkoutMutation.mutate(
      {
        goal: aiGoal,
        duration: parseInt(aiDuration),
        targetMuscles: aiTargetMuscles,
        instructions: aiInstructions,
        exercises: exerciseReferences,
      },
      {
        onSuccess: (data) => {
          // Clear existing workout first
          clearWorkout();

          // Set AI-generated workout name and description
          setWorkoutName(data.workoutName || "AI Generated Workout");
          setWorkoutDescription(
            data.workoutDescription || "Personalized workout created by AI"
          );

          // Add exercises with AI-recommended values
          data.exercises.forEach((aiExercise) => {
            const fullExercise = exercisesData.find(
              (ex) => ex.id === aiExercise.exerciseId
            );
            if (fullExercise) {
              // Add exercise with initial values directly
              addExercise(fullExercise, undefined, {
                sets: aiExercise.sets || 3,
                reps: aiExercise.reps || 10,
                restTime: aiExercise.restTime || 60,
                notes: aiExercise.notes,
              });
            }
          });

          toast.success("Workout generated successfully!");
        },
        onError: (err: Error) => {
          console.error("❌ Error generating workout:", err);
          toast.error(err.message || "Failed to generate workout");
        },
      }
    );
  };

  // Check if AI is generating
  const isGenerating = generateAIWorkoutMutation.isPending;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <SectionHeader
          title="AI Workout Generator"
          description="Build your perfect workout with AI assistance or manually"
          titleSize="t1"
        />
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
        <Tabs
          value={mobileView}
          onValueChange={(v) => setMobileView(v as "exercises" | "workout" | "ai")}
          className="flex flex-col h-full"
        >
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="exercises">
              <Dumbbell className="h-4 w-4 mr-2" />
              Exercises
            </TabsTrigger>
            <TabsTrigger value="workout">
              <GripVertical className="h-4 w-4 mr-2" />
              Workout
              {workoutExercises.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {workoutExercises.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="h-4 w-4 mr-2" />
              AI
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="exercises"
            className="mt-4 space-y-4 flex-1 overflow-hidden flex flex-col"
          >
            <WorkoutExerciseLibrary
              exercises={exercises}
              isLoading={isLoading}
              error={error}
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
              onDragStart={handleLibraryDragStart}
              onDragOver={handleLibraryDragOver}
              onDrop={handleLibraryDrop}
              onExerciseClick={(exercise) => addExercise(exercise)}
              disabled={isGenerating}
              isMobile={true}
            />
          </TabsContent>

          <TabsContent value="workout" className="mt-4 flex-1 overflow-hidden flex flex-col">
            <WorkoutBuilderColumn
              workoutName={workoutName}
              workoutDescription={workoutDescription}
              workoutExercises={workoutExercises}
              draggedWorkoutIndex={draggedWorkoutIndex}
              isSaving={createWorkoutMutation.isPending}
              disabled={isGenerating}
              onNameChange={setWorkoutName}
              onDescriptionChange={setWorkoutDescription}
              onUpdateExercise={updateExercise}
              onRemoveExercise={removeExercise}
              onDragStart={handleWorkoutDragStart}
              onDragOver={handleWorkoutDragOver}
              onDrop={handleWorkoutDrop}
              onDragEnd={handleWorkoutDragEnd}
              onClearWorkout={clearWorkout}
              onSaveWorkout={handleSaveWorkout}
            />
          </TabsContent>

          <TabsContent value="ai" className="mt-4 flex-1 overflow-y-auto">
            <AIGeneratorColumn
              goal={aiGoal}
              duration={aiDuration}
              targetMuscles={aiTargetMuscles}
              instructions={aiInstructions}
              onGoalChange={setAiGoal}
              onDurationChange={setAiDuration}
              onTargetMusclesChange={setAiTargetMuscles}
              onInstructionsChange={setAiInstructions}
              onGenerate={handleGenerateAI}
              loading={isGenerating}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop Layout - 3 Columns */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6 flex-1 overflow-hidden">
        {/* Left Column - Exercise Library */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col overflow-hidden">
          <WorkoutExerciseLibrary
            exercises={exercises}
            isLoading={isLoading}
            error={error}
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
            onDragStart={handleLibraryDragStart}
            onDragOver={handleLibraryDragOver}
            onDrop={handleLibraryDrop}
            disabled={isGenerating}
          />
        </div>

        {/* Middle Column - Workout Builder */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col overflow-hidden">
          <WorkoutBuilderColumn
            workoutName={workoutName}
            workoutDescription={workoutDescription}
            workoutExercises={workoutExercises}
            draggedWorkoutIndex={draggedWorkoutIndex}
            isSaving={createWorkoutMutation.isPending}
            disabled={isGenerating}
            onNameChange={setWorkoutName}
            onDescriptionChange={setWorkoutDescription}
            onUpdateExercise={updateExercise}
            onRemoveExercise={removeExercise}
            onDragStart={handleWorkoutDragStart}
            onDragOver={handleWorkoutDragOver}
            onDrop={handleWorkoutDrop}
            onDragEnd={handleWorkoutDragEnd}
            onClearWorkout={clearWorkout}
            onSaveWorkout={handleSaveWorkout}
          />
        </div>

        {/* Right Column - AI Generator */}
        <div className="lg:col-span-3 xl:col-span-4 flex flex-col overflow-hidden">
          <AIGeneratorColumn
            goal={aiGoal}
            duration={aiDuration}
            targetMuscles={aiTargetMuscles}
            instructions={aiInstructions}
            onGoalChange={setAiGoal}
            onDurationChange={setAiDuration}
            onTargetMusclesChange={setAiTargetMuscles}
            onInstructionsChange={setAiInstructions}
            onGenerate={handleGenerateAI}
            loading={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}
