import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@email.com" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // Demo: acepta cualquier email con contraseña "1234"
        // Reemplazar con validación real contra MongoDB cuando esté lista
        if (!credentials?.email || !credentials?.password) return null;
        if (credentials.password !== "1234") return null;

        return {
          id: "1",
          name: credentials.email.split("@")[0],
          email: credentials.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
