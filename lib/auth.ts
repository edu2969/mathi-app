import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "./mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // Validar que lleguen las credenciales
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Correo y contraseña requeridos");
        }

        try {
          // Conectar a MongoDB
          const db = await connectDB();
          
          // Buscar usuario por email
          const user = await db.collection("users").findOne({
            email: credentials.email,
          });

          // Si no existe el usuario
          if (!user) {
            throw new Error("Credenciales inválidas");
          }

          // Validar contraseña (asumiendo que está hasheada con bcrypt)
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Credenciales inválidas");
          }

          // ✅ Usuario autenticado exitosamente
          return {
            id: user._id.toString(),
            name: user.name || user.email.split('@')[0],
            email: user.email,
            role: user.role || "ESTUDIANTE", // Valor por defecto
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          throw new Error("Error al validar credenciales");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "ESTUDIANTE";
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirigir a login si hay error
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
};