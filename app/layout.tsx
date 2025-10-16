// app/layout.tsx (Server Component)
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";

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
        <QueryProvider>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
