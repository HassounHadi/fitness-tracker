import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "@/lib/jwt";

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
        if (!user || !user.password) return null;

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

        token.accessToken = accessToken;
        token.refreshToken = refreshToken;
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000; // 15 min
      }

      // If token has error (user deleted), return null to force re-login
      if (token.error) {
        return null as any;
      }

      // If access token not expired, return it
      if (Date.now() < (token.accessTokenExpires as number)) return token;

      // Otherwise refresh it
      const refreshed = await refreshAccessToken(token);
      return refreshed;
    },

    async session({ session, token }) {
      // If token has error (user deleted), return null to force re-login
      if (token?.error) {
        return null as any;
      }

      session.user.id = token.sub ?? "";
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpires = token.accessTokenExpires;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

async function refreshAccessToken(token: any) {
  try {
    const decoded = verifyToken(
      token.refreshToken,
      process.env.JWT_REFRESH_SECRET!
    );
    if (!decoded) throw new Error("Invalid refresh token");

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });
    if (!user) throw new Error("User not found");

    const newAccessToken = generateAccessToken(user);

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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
