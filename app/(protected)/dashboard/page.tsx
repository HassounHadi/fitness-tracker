"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/common/section-header";
import {
  Dumbbell,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  Apple,
  Plus,
} from "lucide-react";
import { CircularRings } from "@/components/ui/circular-rings";

export default function DashboardPage() {
  const nutritionRings = [
    {
      name: "Protein",
      actual: 120,
      goal: 150,
      color: "#3b82f6",
      unit: "g",
    },
    {
      name: "Carbs",
      actual: 180,
      goal: 200,
      color: "#10b981",
      unit: "g",
    },
    {
      name: "Fats",
      actual: 55,
      goal: 60,
      color: "#f59e0b",
      unit: "g",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}

      <SectionHeader
        title="Welcome back!"
        description="Here's your fitness overview for today"
        titleSize="t1"
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Workout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Workout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex-1">
                  <h4 className="t4">Upper Body Strength</h4>
                  <p className="p2 text-muted-foreground mt-1">
                    5 exercises • 45 min
                  </p>
                </div>
                <Button size="sm">Start</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-accent" />
              Today's Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CircularRings
              rings={nutritionRings}
              centerContent={{
                label: "Calories",
                actual: 1850,
                goal: 2000,
              }}
            />
            <Button variant="secondary" className="w-full mt-6">
              Log Meal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
