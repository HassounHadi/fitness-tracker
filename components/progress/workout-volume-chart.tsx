"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface WorkoutVolumeData {
  date: string;
  volume: number;
  sets: number;
  reps: number;
  duration: number;
  exerciseCount: number;
}

interface WorkoutVolumeChartProps {
  data: WorkoutVolumeData[];
}

export function WorkoutVolumeChart({ data }: WorkoutVolumeChartProps) {
  // Format data for the chart
  const chartData = data.map((entry) => ({
    date: format(new Date(entry.date), "MMM dd"),
    volume: Math.round(entry.volume),
    sets: entry.sets,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workout Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No workout data available. Complete your first workout!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Volume</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total volume (reps × weight) and sets completed per workout
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
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
            <Bar
              yAxisId="left"
              dataKey="volume"
              fill="hsl(var(--primary))"
              name="Volume (kg)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="sets"
              fill="hsl(var(--accent))"
              name="Total Sets"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
