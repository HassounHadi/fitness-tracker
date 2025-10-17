"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

interface AIGeneratorColumnProps {
  goal: string;
  duration: string;
  targetMuscles: string[];
  instructions: string;
  onGoalChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onTargetMusclesChange: (muscles: string[]) => void;
  onInstructionsChange: (value: string) => void;
  onGenerate: () => void;
  loading?: boolean;
}

const MUSCLE_GROUPS = ["chest", "back", "shoulders", "arms", "legs", "core"];

export function AIGeneratorColumn({
  goal,
  duration,
  targetMuscles,
  instructions,
  onGoalChange,
  onDurationChange,
  onTargetMusclesChange,
  onInstructionsChange,
  onGenerate,
  loading = false,
}: AIGeneratorColumnProps) {
  const toggleMuscle = (muscle: string) => {
    if (targetMuscles.includes(muscle)) {
      onTargetMusclesChange(targetMuscles.filter((m) => m !== muscle));
    } else {
      onTargetMusclesChange([...targetMuscles, muscle]);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5 text-accent fill-accent" />
          AI Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 overflow-y-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-goal-desktop">Fitness Goal</Label>
          <Select value={goal} onValueChange={onGoalChange}>
            <SelectTrigger id="ai-goal-desktop">
              <SelectValue placeholder="Select your goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="build_muscle">Build Muscle</SelectItem>
              <SelectItem value="lose_weight">Lose Weight</SelectItem>
              <SelectItem value="general_fitness">General Fitness</SelectItem>
              <SelectItem value="improve_endurance">
                Improve Endurance
              </SelectItem>
              <SelectItem value="increase_strength">
                Increase Strength
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-duration-desktop">Workout Duration</Label>
          <Select value={duration} onValueChange={onDurationChange}>
            <SelectTrigger id="ai-duration-desktop">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target Muscle Groups</Label>
          <div className="grid grid-cols-2 gap-2">
            {MUSCLE_GROUPS.map((muscle) => (
              <Button
                key={muscle}
                variant={targetMuscles.includes(muscle) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMuscle(muscle)}
                className="capitalize"
              >
                {muscle}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-instructions-desktop">
            Additional Instructions
          </Label>
          <Textarea
            id="ai-instructions-desktop"
            placeholder="e.g., Focus on compound movements..."
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={onGenerate}
          className="w-full gap-2"
          size="lg"
          disabled={loading || !goal || !duration || targetMuscles.length === 0}
        >
          <Sparkles className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {loading ? "Generating..." : "Generate with AI"}
        </Button>

        <div className="border-t pt-4 space-y-2">
          <p className="p3 text-accent text-center">
            {loading
              ? "AI is creating your personalized workout..."
              : "AI will analyze your profile and create a personalized workout"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
