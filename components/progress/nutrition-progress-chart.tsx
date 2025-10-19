"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface NutritionData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionProgressChartProps {
  data: NutritionData[];
  goals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function NutritionProgressChart({
  data,
  goals,
}: NutritionProgressChartProps) {
  // Group nutrition logs by date and sum the macros
  const dailyNutrition = data.reduce((acc, entry) => {
    const dateKey = format(new Date(entry.date), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }
    acc[dateKey].calories += entry.calories;
    acc[dateKey].protein += entry.protein;
    acc[dateKey].carbs += entry.carbs;
    acc[dateKey].fat += entry.fat;
    return acc;
  }, {} as Record<string, NutritionData>);

  const chartData = Object.values(dailyNutrition)
    .map((entry) => ({
      date: format(new Date(entry.date), "MMM dd"),
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      calorieGoal: goals?.calories,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No nutrition data available. Start logging your meals!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Trends</CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily calorie and macro intake over time
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="calories"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
              name="Calories (kcal)"
            />
            <Area
              type="monotone"
              dataKey="protein"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.4}
              name="Protein (g)"
            />
            <Area
              type="monotone"
              dataKey="carbs"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.4}
              name="Carbs (g)"
            />
            <Area
              type="monotone"
              dataKey="fat"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.4}
              name="Fat (g)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
