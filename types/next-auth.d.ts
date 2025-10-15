import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string; // we now tell TS every user has an id
    } & DefaultSession["user"];
  }
}
