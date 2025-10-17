"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

const nutritionSchema = z.object({
  log: z
    .string()
    .min(10, "Please describe your meal in at least 10 characters."),
});

type NutritionFormValues = z.infer<typeof nutritionSchema>;

export function NutritionLogDialog() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NutritionFormValues>({
    resolver: zodResolver(nutritionSchema),
  });

  const onSubmit = (data: NutritionFormValues) => {
    console.log("Nutrition log submitted:", data);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full mt-6">
          Log Meal
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Nutrition</DialogTitle>
          <DialogDescription>
            Describe what you ate today — we’ll parse it later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="log">Meal Description</Label>
            <Textarea
              id="log"
              placeholder="E.g. 2 eggs, oatmeal with milk, apple, and coffee"
              rows={4}
              {...register("log")}
            />
            {errors.log && (
              <p className="text-sm text-red-500">{errors.log.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
