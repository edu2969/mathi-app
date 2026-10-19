import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login?error=token_invalido`
      );
    }

    const db = await connectDB();

    const user = await db.collection("users").findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login?error=token_expirado`
      );
    }

    // Marcar email como verificado y limpiar token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: { emailVerified: true },
        $unset: { verificationToken: "", verificationTokenExpires: "" },
      }
    );

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail({
        to: user.email,
        name: user.name || "usuario",
      });
    } catch (emailError) {
      console.error("Error enviando email de bienvenida:", emailError);
    }

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login?verified=1`
    );
  } catch (error) {
    console.error("Error verificando email:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login?error=verificacion_fallida`
    );
  }
}
