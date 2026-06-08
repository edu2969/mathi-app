import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (role !== "DEPORTISTA" && role !== "ENTRENADOR") {
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

    // Crear el usuario
    const result = await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        userId: result.insertedId,
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
