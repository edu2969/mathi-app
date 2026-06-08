import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "ESTUDIANTE";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "ESTUDIANTE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "ESTUDIANTE";
  }
}