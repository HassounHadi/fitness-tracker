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

interface MeasurementData {
  date: string;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  biceps: number | null;
  thighs: number | null;
}

interface BodyMeasurementsChartProps {
  data: MeasurementData[];
}

export function BodyMeasurementsChart({ data }: BodyMeasurementsChartProps) {
  // Filter and format data - only include entries with at least one measurement
  const chartData = data
    .filter(
      (entry) =>
        entry.chest !== null ||
        entry.waist !== null ||
        entry.hips !== null ||
        entry.biceps !== null ||
        entry.thighs !== null
    )
    .map((entry) => ({
      date: format(new Date(entry.date), "MMM dd"),
      chest: entry.chest,
      waist: entry.waist,
      hips: entry.hips,
      biceps: entry.biceps,
      thighs: entry.thighs,
    }))
    .reverse(); // Show oldest to newest

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Body Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No measurement data available. Start tracking your measurements!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Body Measurements</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track changes in your body measurements (cm)
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
              dataKey="chest"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Chest (cm)"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="waist"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Waist (cm)"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="hips"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Hips (cm)"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="biceps"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Biceps (cm)"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="thighs"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Thighs (cm)"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
