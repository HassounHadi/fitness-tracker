"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useCreateNutritionLog } from "@/hooks/use-nutrition";
import { Loader2, Check } from "lucide-react";

const nutritionSchema = z.object({
  mealName: z.string().optional(),
  description: z
    .string()
    .min(5, "Please describe your meal in at least 5 characters"),
});

type NutritionFormValues = z.infer<typeof nutritionSchema>;

interface ParsedNutrition {
  foods: Array<{
    name: string;
    servingQty: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    photo: string | null;
  }>;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  originalQuery: string;
}

export function NutritionLogDialog() {
  const [open, setOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedNutrition | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const createNutritionMutation = useCreateNutritionLog();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<NutritionFormValues>({
    resolver: zodResolver(nutritionSchema),
  });

  const description = watch("description");

  // Parse nutrition using Nutritionix API
  const handleAnalyze = async () => {
    if (!description || description.length < 10) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/nutrition/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: description }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze nutrition");
      }

      const data = await response.json();
      setParsedData(data);
    } catch (error) {
      console.error("Error analyzing nutrition:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data: NutritionFormValues) => {
    if (!parsedData) {
      // If not analyzed yet, analyze first
      await handleAnalyze();
      return;
    }

    // Save to database
    await createNutritionMutation.mutateAsync({
      mealName: data.mealName,
      description: data.description,
      calories: parsedData.totals.calories,
      protein: parsedData.totals.protein,
      carbs: parsedData.totals.carbs,
      fat: parsedData.totals.fat,
    });

    reset();
    setParsedData(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full mt-6">
          Log Meal
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Meal</DialogTitle>
          <DialogDescription>
            Describe what you ate and we'll analyze the nutrition
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Meal Name */}
          <div className="space-y-2">
            <Label htmlFor="mealName">Meal Name (Optional)</Label>
            <Input
              id="mealName"
              placeholder="e.g., Breakfast, Lunch, Snack"
              {...register("mealName")}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">What did you eat?</Label>
            <Textarea
              id="description"
              placeholder="E.g. 2 scrambled eggs, bowl of oatmeal with banana, coffee"
              rows={3}
              {...register("description")}
              disabled={isAnalyzing}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Analyze Button */}
          {!parsedData && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !description || description.length < 10}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                "Analyze Nutrition"
              )}
            </Button>
          )}

          {/* Parsed Results */}
          {parsedData && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center gap-2 text-success">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Nutrition Analyzed</span>
              </div>

              {/* Foods List */}
              <div className="space-y-2">
                {parsedData.foods.map((food, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">{food.name}</span>
                    <span className="text-muted-foreground ml-2">
                      ({food.servingQty} {food.servingUnit})
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Calories</p>
                  <p className="font-semibold">{parsedData.totals.calories}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="font-semibold">{parsedData.totals.protein}g</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="font-semibold">{parsedData.totals.carbs}g</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Fat</p>
                  <p className="font-semibold">{parsedData.totals.fat}g</p>
                </div>
              </div>

              {/* Re-analyze button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setParsedData(null);
                  handleAnalyze();
                }}
              >
                Re-analyze
              </Button>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-2">
            {parsedData && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  reset();
                  setParsedData(null);
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!parsedData || createNutritionMutation.isPending}
            >
              {createNutritionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Meal"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
