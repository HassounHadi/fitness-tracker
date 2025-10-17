import { StatCard } from "@/components/progress/stat-card";
import { ProgressLogDialog } from "@/components/progress/progress-log-dialog";
import { Dumbbell, Flame, Target } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="flex flex-col gap-10">
      <ProgressLogDialog />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </div>
  );
}
