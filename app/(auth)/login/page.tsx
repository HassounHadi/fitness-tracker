"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/public/icons/GoogleIcon";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res?.error) {
      try {
        const errorResponse = await fetch(`/api/auth/error?error=${res.error}`);
        const errorData = await errorResponse.json();
        alert(errorData.message || "Something went wrong.");
        console.log(errorData.message);
      } catch {
        alert("Login failed. Please try again.");
      }
    } else alert("Logged in successfully!");
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/40 via-background to-secondary/50 px-6 w-full">
      <Card className="w-full max-w-lg shadow-lg rounded-2xl border border-border/40">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="t3 text-primary">Welcome back</CardTitle>
          <p className="p1 text-accent">
            Log in to continue tracking your progress
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>

            <Button
              variant="ghost"
              className="w-full mt-2 text-foreground border border-border hover:scale-100 hover:bg-accent/5 hover:text-accent hover:border-accent"
              onClick={() => signIn("google")}
            >
              <GoogleIcon className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Don’t have an account?{" "}
              <Link href="/signup" className="p2 text-primary underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
