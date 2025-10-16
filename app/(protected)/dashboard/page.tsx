"use client";
import { useSession } from "next-auth/react";
export default function DashboardPage() {
  const { data: session, status } = useSession();
  if (status === "loading") return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p>Welcome, {session?.user.email}!</p>
      <br />
      <p>Your access token is: {session?.accessToken}</p>
      <br />
      <p>Your refresh token is: {session?.refreshToken}</p>
      <br />
      <p>Your user ID is: {session?.user.id}</p>
      <br />
      <p>Your whole session is: {JSON.stringify(session)}</p>
    </div>
  );
}
