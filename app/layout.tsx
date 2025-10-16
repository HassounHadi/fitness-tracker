// app/layout.tsx (Server Component)
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar-04/navbar-04";
import { Inter } from "next/font/google";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FitTrack - Your Ultimate Fitness Companion",
  description:
    "Track your fitness journey with personalized insights and AI-driven coaching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Navbar />
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
