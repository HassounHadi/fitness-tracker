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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const progressSchema = z.object({
  weight: z
    .string()
    .min(1, "Weight is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Weight must be a positive number",
    }),
  bodyFat: z
    .string()
    .min(1, "Body fat % is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100,
      {
        message: "Body fat % must be between 0 and 100",
      }
    ),
});

type ProgressFormValues = z.infer<typeof progressSchema>;

export function ProgressLogDialog() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
  });

  const onSubmit = (data: ProgressFormValues) => {
    const formatted = {
      weight: Number(data.weight),
      bodyFat: Number(data.bodyFat),
    };

    console.log("Progress log submitted:", formatted);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4 w-fit self-end">Log Progress</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Progress</DialogTitle>
          <DialogDescription>
            Enter your current weight and body fat percentage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Enter your weight"
              {...register("weight")}
            />
            {errors.weight && (
              <p className="text-sm text-red-500">{errors.weight.message}</p>
            )}
          </div>

          {/* Body Fat */}
          <div className="space-y-2">
            <Label htmlFor="bodyFat">Body Fat (%)</Label>
            <Input
              id="bodyFat"
              type="number"
              step="0.1"
              placeholder="Enter your body fat %"
              {...register("bodyFat")}
            />
            {errors.bodyFat && (
              <p className="text-sm text-red-500">{errors.bodyFat.message}</p>
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
