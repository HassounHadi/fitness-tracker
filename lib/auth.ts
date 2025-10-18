import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { prisma } from "./prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "./jwt";
import bcrypt from "bcrypt";

async function refreshAccessToken(token: JWT) {
  try {
    if (!token.refreshToken || typeof token.refreshToken !== 'string') {
      throw new Error("No refresh token available");
    }

    const decoded = verifyToken(
      token.refreshToken,
      process.env.JWT_REFRESH_SECRET!
    );
    if (!decoded || !decoded.sub) throw new Error("Invalid refresh token");

    const userId = typeof decoded.sub === 'function' ? decoded.sub() : decoded.sub;
    if (!userId) throw new Error("Invalid user ID");

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.email) throw new Error("User not found");

    const newAccessToken = generateAccessToken({ id: user.id, email: user.email });

    return {
      ...token,
      accessToken: newAccessToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password || !user.email) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return { id: user.id, email: user.email };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // On initial login
      if (user && user.id && user.email) {
        const safeUser = { id: user.id, email: user.email as string };
        const accessToken = generateAccessToken(safeUser);
        const refreshToken = generateRefreshToken(safeUser);

        // Fetch user's onboarding status
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            fitnessGoal: true,
            fitnessLevel: true,
            height: true,
            currentWeight: true,
            targetWeight: true,
          },
        });

        const isOnboarded = !!(
          dbUser?.fitnessGoal &&
          dbUser?.fitnessLevel &&
          dbUser?.height &&
          dbUser?.currentWeight &&
          dbUser?.targetWeight
        );

        token.accessToken = accessToken;
        token.refreshToken = refreshToken;
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000; // 15 min
        token.isOnboarded = isOnboarded;
      }

      // If token has error (user deleted), return token with error
      if (token.error) {
        return token;
      }

      // If access token not expired, return it
      if (Date.now() < (token.accessTokenExpires as number)) return token;

      // Otherwise refresh it
      const refreshed = await refreshAccessToken(token);
      return refreshed;
    },

    async session({ session, token }) {
      // If token has error (user deleted), return session without user data
      if (token?.error) {
        return session;
      }

      session.user.id = token.sub ?? "";
      (session as typeof session & { accessToken?: unknown }).accessToken = token.accessToken;
      (session as typeof session & { refreshToken?: unknown }).refreshToken = token.refreshToken;
      (session as typeof session & { accessTokenExpires?: unknown }).accessTokenExpires = token.accessTokenExpires;
      (session as typeof session & { isOnboarded?: unknown }).isOnboarded = token.isOnboarded;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
