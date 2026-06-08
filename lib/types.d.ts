import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: "ADMIN" | "ESTUDIANTE";
  }
  
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "ESTUDIANTE";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "ESTUDIANTE";
  }
}