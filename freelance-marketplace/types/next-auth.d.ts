import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "CLIENT" | "FREELANCER"
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "CLIENT" | "FREELANCER"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "CLIENT" | "FREELANCER"
  }
}