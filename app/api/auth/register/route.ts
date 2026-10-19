import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const validRoles = ["ADMIN", "ESTUDIANTE"];
    const userRole = role || "ESTUDIANTE";
    if (!validRoles.includes(userRole)) {
      return NextResponse.json(
        { error: "Rol inválido" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Verificar si el usuario ya existe
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Crear el usuario (no verificado aún)
    const result = await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      name,
      role: userRole,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
      createdAt: new Date(),
    });

    // Enviar email de verificación
    try {
      await sendVerificationEmail({
        to: email,
        name,
        token: verificationToken,
        baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
      });
    } catch (emailError) {
      console.error("Error enviando email de verificación:", emailError);
      // No fallar el registro si el email falla, pero advertir
    }

    return NextResponse.json(
      {
        message:
          "Usuario creado exitosamente. Revisa tu correo para confirmar tu cuenta.",
        userId: result.insertedId,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}
