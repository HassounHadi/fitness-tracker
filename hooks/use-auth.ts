import { useMutation } from "@tanstack/react-query";
import { signIn, signOut } from "next-auth/react";
import { api } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OnboardingData {
  name: string;
  height: number;
  currentWeight: number;
  targetWeight: number;
  fitnessGoal: string;
  fitnessLevel: string;
  availableEquipment: string[];
  dailyCalorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

// Signup mutation
export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await api.post("/api/auth/signup", data);

      if (!response.success)
        throw new Error(response.message || "Signup failed");

      return response.data;
    },
    onSuccess: () => router.push("/login"),
  });
}

// Login mutation
export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) throw new Error("Invalid credentials");

      // Fetch session to check onboarding status
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      return session;
    },
    onSuccess: (session) => {
      if (session && !session.isOnboarded) router.push("/onboarding");
      else router.push("/dashboard");
    },
  });
}

// Onboarding mutation
export function useOnboarding() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: OnboardingData) => {
      const response = await api.post("/api/user/onboarding", data);

      if (!response.success)
        throw new Error(response.message || "Onboarding failed");
      return response.data;
    },
    onSuccess: () => router.push("/dashboard"),
  });
}

// Logout mutation
export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => await signOut({ redirect: false }),
    onSuccess: () => router.push("/login"),
  });
}
