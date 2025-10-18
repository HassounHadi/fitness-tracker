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
import { Textarea } from "@/components/ui/textarea";
import { useCreateProgressLog } from "@/hooks/use-progress";
import { Loader2 } from "lucide-react";

const progressSchema = z.object({
  weight: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Weight must be a positive number",
    }),
  bodyFat: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
      {
        message: "Body fat % must be between 0 and 100",
      }
    ),
  chest: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Chest must be a positive number",
    }),
  waist: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Waist must be a positive number",
    }),
  hips: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Hips must be a positive number",
    }),
  biceps: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Biceps must be a positive number",
    }),
  thighs: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Thighs must be a positive number",
    }),
  notes: z.string().optional(),
});

type ProgressFormValues = z.infer<typeof progressSchema>;

export function ProgressLogDialog() {
  const [open, setOpen] = useState(false);
  const createProgressMutation = useCreateProgressLog();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
  });

  const onSubmit = async (data: ProgressFormValues) => {
    const payload: {
      weight?: number;
      bodyFat?: number;
      chest?: number;
      waist?: number;
      hips?: number;
      biceps?: number;
      thighs?: number;
      notes?: string;
    } = {};

    if (data.weight) payload.weight = Number(data.weight);
    if (data.bodyFat) payload.bodyFat = Number(data.bodyFat);
    if (data.chest) payload.chest = Number(data.chest);
    if (data.waist) payload.waist = Number(data.waist);
    if (data.hips) payload.hips = Number(data.hips);
    if (data.biceps) payload.biceps = Number(data.biceps);
    if (data.thighs) payload.thighs = Number(data.thighs);
    if (data.notes) payload.notes = data.notes;

    await createProgressMutation.mutateAsync(payload);
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto px-1">
          {/* Weight & Body Fat */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="75.5"
                {...register("weight")}
              />
              {errors.weight && (
                <p className="text-sm text-red-500">{errors.weight.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyFat">Body Fat (%)</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                placeholder="18.5"
                {...register("bodyFat")}
              />
              {errors.bodyFat && (
                <p className="text-sm text-red-500">{errors.bodyFat.message}</p>
              )}
            </div>
          </div>

          {/* Measurements Section */}
          <div className="pt-2">
            <h4 className="text-sm font-semibold mb-3">Measurements (cm)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chest">Chest</Label>
                <Input
                  id="chest"
                  type="number"
                  step="0.1"
                  placeholder="95"
                  {...register("chest")}
                />
                {errors.chest && (
                  <p className="text-sm text-red-500">{errors.chest.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="waist">Waist</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  placeholder="80"
                  {...register("waist")}
                />
                {errors.waist && (
                  <p className="text-sm text-red-500">{errors.waist.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hips">Hips</Label>
                <Input
                  id="hips"
                  type="number"
                  step="0.1"
                  placeholder="95"
                  {...register("hips")}
                />
                {errors.hips && (
                  <p className="text-sm text-red-500">{errors.hips.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="biceps">Biceps</Label>
                <Input
                  id="biceps"
                  type="number"
                  step="0.1"
                  placeholder="35"
                  {...register("biceps")}
                />
                {errors.biceps && (
                  <p className="text-sm text-red-500">{errors.biceps.message}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="thighs">Thighs</Label>
                <Input
                  id="thighs"
                  type="number"
                  step="0.1"
                  placeholder="55"
                  {...register("thighs")}
                />
                {errors.thighs && (
                  <p className="text-sm text-red-500">{errors.thighs.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about your progress..."
              rows={3}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-2 sticky bottom-0 bg-background">
            <Button type="submit" disabled={createProgressMutation.isPending}>
              {createProgressMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Progress"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
