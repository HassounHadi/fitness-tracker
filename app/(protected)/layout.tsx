// app/protected/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-primary text-white">
        <h1>My App</h1>
      </header>

      <main className="flex-1 p-6">{children}</main>

      <footer className="p-4 bg-gray-100 text-center">
        &copy; 2025 My App
      </footer>
    </div>
  );
}
