import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import { connectDB } from "@/lib/mongodb";
import { sendVerificationEmail } from "@/lib/email";

import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        const db = await connectDB();

        const user = await db
          .collection("users")
          .findOne({
            email: credentials?.email,
          });

        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        // Si el usuario se registró con Google/Meta, no tiene contraseña
        if (!user.password) {
          throw new Error(
            "Esta cuenta fue creada con Google o Meta. Inicia sesión con esa opción."
          );
        }

        // Verificar email confirmado
        if (!user.emailVerified) {
          throw new Error(
            "Por favor confirma tu correo electrónico antes de iniciar sesión."
          );
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
          image: user.image,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    FacebookProvider({
      clientId: process.env.META_CLIENT_ID!,
      clientSecret: process.env.META_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      const db = await connectDB();

      // Para proveedores OAuth (Google/Meta)
      if (account?.provider === "google" || account?.provider === "facebook") {
        const email = user.email;
        if (!email) return false;

        let existingUser = await db
          .collection("users")
          .findOne({ email });

        if (!existingUser) {
          // Crear usuario nuevo con proveedor OAuth
          const result = await db.collection("users").insertOne({
            email,
            name: user.name || "",
            image: user.image || "",
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            role: "ESTUDIANTE",
            emailVerified: true, // Google/Meta ya verifican el email
            createdAt: new Date(),
          });
          existingUser = await db
            .collection("users")
            .findOne({ _id: result.insertedId });
        } else {
          // Vincular proveedor si no está vinculado
          if (!existingUser.provider) {
            await db
              .collection("users")
              .updateOne(
                { _id: existingUser._id },
                {
                  $set: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    image: user.image || existingUser.image,
                  },
                }
              );
          }
        }

        return !!existingUser;
      }

      // Para credenciales: permitir signIn solo si email está verificado
      if (account?.provider === "credentials") {
        const existingUser = await db
          .collection("users")
          .findOne({ email: user.email });
        if (!existingUser || !existingUser.emailVerified) {
          return false;
        }
        return true;
      }

      return true;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        const db = await connectDB();
        const dbUser = await db
          .collection("users")
          .findOne({ email: user.email });

        // Usar el _id de MongoDB del usuario (creado/vinculado en signIn)
        // para que el id de sesión sea un ObjectId válido y se pueda registrar progreso.
        token.id = dbUser?._id?.toString() || user.id;
        token.email = user.email;
        token.role = user.role || (dbUser?.role || "ESTUDIANTE");
        token.image = user.image;
        token.provider = account?.provider || dbUser?.provider;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role =
          (token.role as "ADMIN" | "ESTUDIANTE") || "ESTUDIANTE";
        session.user.image = token.image as string | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  events: {
    async createUser({ user }) {
      // Enviar email de verificación tras registro con credenciales
      const db = await connectDB();
      const dbUser = await db
        .collection("users")
        .findOne({ email: user.email });

      if (dbUser && !dbUser.emailVerified) {
        const crypto = await import("crypto");
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(
          Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
        );

        await db.collection("users").updateOne(
          { _id: dbUser._id },
          {
            $set: {
              verificationToken: token,
              verificationTokenExpires: expires,
            },
          }
        );

        await sendVerificationEmail({
          to: user.email!,
          name: user.name || "usuario",
          token,
          baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
        });
      }
    },
  },
});

export { handler as GET, handler as POST };