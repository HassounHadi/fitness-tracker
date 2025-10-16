"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Step 1: Profile Information
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  height: z.string().min(1, { message: "Height is required" }),
  currentWeight: z.string().min(1, { message: "Current weight is required" }),
  targetWeight: z.string().min(1, { message: "Target weight is required" }),
});

// Step 2: Fitness Goals
const goalsSchema = z.object({
  fitnessGoal: z.string().min(1, { message: "Please select a fitness goal" }),
  fitnessLevel: z
    .string()
    .min(1, { message: "Please select your fitness level" }),
});

// Step 3: Equipment & Nutrition
const equipmentSchema = z.object({
  availableEquipment: z
    .array(z.string())
    .min(1, { message: "Select at least one equipment option" }),
  dailyCalorieGoal: z.string().min(1, { message: "Calorie goal is required" }),
  proteinGoal: z.string().min(1, { message: "Protein goal is required" }),
  carbGoal: z.string().min(1, { message: "Carb goal is required" }),
  fatGoal: z.string().min(1, { message: "Fat goal is required" }),
});

type ProfileForm = z.infer<typeof profileSchema>;
type GoalsForm = z.infer<typeof goalsSchema>;
type EquipmentForm = z.infer<typeof equipmentSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form for Step 1
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  // Form for Step 2
  const goalsForm = useForm<GoalsForm>({
    resolver: zodResolver(goalsSchema),
  });

  // Form for Step 3
  const equipmentForm = useForm<EquipmentForm>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      availableEquipment: [],
    },
  });

  const fitnessGoals = [
    { value: "build_muscle", label: "Build Muscle" },
    { value: "lose_weight", label: "Lose Weight" },
    { value: "general_fitness", label: "General Fitness" },
    { value: "improve_endurance", label: "Improve Endurance" },
  ];

  const fitnessLevels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const equipmentOptions = [
    "Bodyweight",
    "Dumbbells",
    "Barbell",
    "Resistance Bands",
    "Kettlebells",
    "Pull-up Bar",
    "Gym Access",
  ];

  const onProfileSubmit = (data: ProfileForm) => {
    console.log("Step 1:", data);
    setStep(2);
  };

  const onGoalsSubmit = (data: GoalsForm) => {
    console.log("Step 2:", data);
    setStep(3);
  };

  const onEquipmentSubmit = async (data: EquipmentForm) => {
    console.log("Step 3:", data);

    // Combine all data from all steps
    const completeData = {
      ...profileForm.getValues(),
      ...goalsForm.getValues(),
      ...data,
      height: parseFloat(profileForm.getValues().height),
      currentWeight: parseFloat(profileForm.getValues().currentWeight),
      targetWeight: parseFloat(profileForm.getValues().targetWeight),
      dailyCalorieGoal: parseInt(data.dailyCalorieGoal),
      proteinGoal: parseInt(data.proteinGoal),
      carbGoal: parseInt(data.carbGoal),
      fatGoal: parseInt(data.fatGoal),
    };

    console.log("Complete onboarding data:", completeData);

    // TODO: Send to API endpoint
    // For now, just redirect to dashboard
    router.push("/dashboard");
  };

  const toggleEquipment = (equipment: string) => {
    const current = equipmentForm.getValues("availableEquipment");
    const updated = current.includes(equipment)
      ? current.filter((e) => e !== equipment)
      : [...current, equipment];
    equipmentForm.setValue("availableEquipment", updated);
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/40 via-background to-secondary/50 px-6 w-full">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl border border-border/40">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="t3 text-primary">
            Complete Your Profile
          </CardTitle>
          <p className="p1 text-muted-foreground">
            Let's personalize your fitness journey
          </p>

          {/* Visual Step Indicator */}
          <div className="flex gap-2 pt-2">
            <div
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                step >= 1 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                step >= 2 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                step >= 3 ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Step 1: Profile Information */}
          {step === 1 && (
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...profileForm.register("name")}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-sm text-error">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    {...profileForm.register("height")}
                  />
                  {profileForm.formState.errors.height && (
                    <p className="text-sm text-error">
                      {profileForm.formState.errors.height.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    placeholder="75"
                    {...profileForm.register("currentWeight")}
                  />
                  {profileForm.formState.errors.currentWeight && (
                    <p className="text-sm text-error">
                      {profileForm.formState.errors.currentWeight.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    placeholder="72"
                    {...profileForm.register("targetWeight")}
                  />
                  {profileForm.formState.errors.targetWeight && (
                    <p className="text-sm text-error">
                      {profileForm.formState.errors.targetWeight.message}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full gap-2">
                Next Step
                <ChevronRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {/* Step 2: Fitness Goals */}
          {step === 2 && (
            <form
              onSubmit={goalsForm.handleSubmit(onGoalsSubmit)}
              className="space-y-6"
            >
              <div className="space-y-3">
                <Label>What's your primary fitness goal?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fitnessGoals.map((goal) => (
                    <label
                      key={goal.value}
                      className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        goalsForm.watch("fitnessGoal") === goal.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        value={goal.value}
                        className="sr-only"
                        {...goalsForm.register("fitnessGoal")}
                      />
                      <span className="p2 font-medium">{goal.label}</span>
                    </label>
                  ))}
                </div>
                {goalsForm.formState.errors.fitnessGoal && (
                  <p className="text-sm text-error">
                    {goalsForm.formState.errors.fitnessGoal.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>What's your fitness level?</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {fitnessLevels.map((level) => (
                    <label
                      key={level.value}
                      className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        goalsForm.watch("fitnessLevel") === level.value
                          ? "border-secondary bg-secondary/10"
                          : "border-border hover:border-secondary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        value={level.value}
                        className="sr-only"
                        {...goalsForm.register("fitnessLevel")}
                      />
                      <span className="p2 font-medium">{level.label}</span>
                    </label>
                  ))}
                </div>
                {goalsForm.formState.errors.fitnessLevel && (
                  <p className="text-sm text-error">
                    {goalsForm.formState.errors.fitnessLevel.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" className="flex-1 gap-2">
                  Next Step
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Equipment & Nutrition */}
          {step === 3 && (
            <form
              onSubmit={equipmentForm.handleSubmit(onEquipmentSubmit)}
              className="space-y-6"
            >
              <div className="space-y-3">
                <Label>What equipment do you have access to?</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {equipmentOptions.map((equipment) => (
                    <label
                      key={equipment}
                      className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        equipmentForm
                          .watch("availableEquipment")
                          .includes(equipment)
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                      onClick={() => toggleEquipment(equipment)}
                    >
                      <span className="p2 font-medium text-center">
                        {equipment}
                      </span>
                    </label>
                  ))}
                </div>
                {equipmentForm.formState.errors.availableEquipment && (
                  <p className="text-sm text-error">
                    {equipmentForm.formState.errors.availableEquipment.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Daily Nutrition Goals</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="dailyCalorieGoal" className="text-sm">
                      Calories
                    </Label>
                    <Input
                      id="dailyCalorieGoal"
                      type="number"
                      placeholder="2000"
                      {...equipmentForm.register("dailyCalorieGoal")}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="proteinGoal" className="text-sm">
                      Protein (g)
                    </Label>
                    <Input
                      id="proteinGoal"
                      type="number"
                      placeholder="150"
                      {...equipmentForm.register("proteinGoal")}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="carbGoal" className="text-sm">
                      Carbs (g)
                    </Label>
                    <Input
                      id="carbGoal"
                      type="number"
                      placeholder="200"
                      {...equipmentForm.register("carbGoal")}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fatGoal" className="text-sm">
                      Fats (g)
                    </Label>
                    <Input
                      id="fatGoal"
                      type="number"
                      placeholder="60"
                      {...equipmentForm.register("fatGoal")}
                    />
                  </div>
                </div>
                {(equipmentForm.formState.errors.dailyCalorieGoal ||
                  equipmentForm.formState.errors.proteinGoal ||
                  equipmentForm.formState.errors.carbGoal ||
                  equipmentForm.formState.errors.fatGoal) && (
                  <p className="text-sm text-error">
                    Please fill in all nutrition goals
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={equipmentForm.formState.isSubmitting}
                  loadingText="Completing setup..."
                >
                  Complete Setup
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
