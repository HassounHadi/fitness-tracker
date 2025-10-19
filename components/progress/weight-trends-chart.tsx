"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface WeightData {
  date: string;
  weight: number | null;
  bodyFat: number | null;
}

interface WeightTrendsChartProps {
  data: WeightData[];
  targetWeight?: number;
}

export function WeightTrendsChart({ data, targetWeight }: WeightTrendsChartProps) {
  // Filter and format data
  const chartData = data
    .filter((entry) => entry.weight !== null)
    .map((entry) => ({
      date: format(new Date(entry.date), "MMM dd"),
      weight: entry.weight,
      target: targetWeight,
    }))
    .reverse(); // Show oldest to newest

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No weight data available. Start logging your progress!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Trends</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your weight progress over time
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              name="Weight (kg)"
            />
            {targetWeight && (
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Target (kg)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
