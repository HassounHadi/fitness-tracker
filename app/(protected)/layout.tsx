// app/protected/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/navbar-04/navbar-04";
import { WorkoutBuilderProvider } from "@/contexts/workout-builder-context";
import { WorkoutBuilderSidebar } from "@/components/workouts/workout-builder-sidebar";
import { WorkoutBuilderFAB } from "@/components/workouts/workout-builder-fab";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken || !session.refreshToken) {
    redirect("/login");
  }

  return (
    <WorkoutBuilderProvider>
      <Navbar />
      <main className="pt-28 min-h-screen pb-4">
        <div className="container mx-auto px-4 md:px-6 max-w-(--breakpoint-xl)">
          {children}
        </div>
      </main>
      <WorkoutBuilderSidebar />
      <WorkoutBuilderFAB />
    </WorkoutBuilderProvider>
  );
}
