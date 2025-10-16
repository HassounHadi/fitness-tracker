// app/protected/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Navbar from "@/components/navbar-04/navbar-04";

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
    <>
      <Navbar />
      {children}
    </>
  );
}
