import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { connectDB } from "@/lib/mongodb";

import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        console.log("credentials", credentials);
        const db = await connectDB();

        console.log("db", db);


        const user = await db
          .collection("users")
          .findOne({
            email: credentials?.email,
          });

        console.log("user", user);

        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        const isValid = await bcrypt.compare(
          credentials!.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback called with token:", token, "and user:", user);
      if (user) {
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.sub!;
      // Ensure role matches expected union type
      const role = token.role as string | undefined;
      if (role === "ADMIN" || role === "ESTUDIANTE") {
        session.user.role = role;
      } else {
        // fallback or undefined if role is unexpected
        // @ts-ignore
        session.user.role = undefined;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };