import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "CLIENT" | "FREELANCER" | "ADMIN";
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "CLIENT" | "FREELANCER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "CLIENT" | "FREELANCER" | "ADMIN";
  }
}