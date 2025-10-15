import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};

        if (!email || !password) {
          throw new Error("Please provide both email and password.");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error("No account found with this email.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Incorrect password.");
        }

        return user; // success
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // You can log or perform extra checks here
      return true;
    },
    async session({ session, token, user }) {
      if (session.user) session.user.id = user?.id ?? token?.sub ?? "";
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
