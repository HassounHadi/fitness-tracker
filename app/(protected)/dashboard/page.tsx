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
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Welcome back!"
          description="Here's your fitness overview for today"
          titleSize="t1"
        />
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Quick Log Workout
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Workouts This Week"
          value="4"
          description="2 more to hit your goal"
          icon={Dumbbell}
          trend={{ value: 20, isPositive: true }}
        />
        <StatCard
          title="Current Weight"
          value="75 kg"
          description="Target: 72 kg"
          icon={Target}
          trend={{ value: 2, isPositive: false }}
        />
        <StatCard
          title="Calories Today"
          value="1,850"
          description="450 remaining"
          icon={Flame}
        />
        <StatCard
          title="Weekly Progress"
          value="85%"
          description="Great job this week!"
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

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
              <div className="text-center py-4">
                <p className="p2 text-muted-foreground">
                  No workout scheduled?{" "}
                  <Button variant="link" className="p-0 h-auto p2">
                    Generate AI Workout
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  title: "Leg Day Workout",
                  time: "2 hours ago",
                  stats: "6 exercises • 50 min",
                },
                {
                  title: "Morning Run",
                  time: "Yesterday",
                  stats: "5.2 km • 28 min",
                },
                {
                  title: "Chest & Triceps",
                  time: "2 days ago",
                  stats: "7 exercises • 45 min",
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="p2 font-medium">{activity.title}</p>
                    <p className="p3 text-muted-foreground">{activity.stats}</p>
                  </div>
                  <p className="p3 text-muted-foreground">{activity.time}</p>
                </div>
              ))}
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
            <Button variant="outline" className="w-full mt-6">
              Log Meal
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Dumbbell className="h-6 w-6 text-primary" />
                <span className="p2">Browse Exercises</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Target className="h-6 w-6 text-secondary" />
                <span className="p2">Set New Goal</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Calendar className="h-6 w-6 text-accent" />
                <span className="p2">Schedule Workout</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <TrendingUp className="h-6 w-6 text-info" />
                <span className="p2">View Progress</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
