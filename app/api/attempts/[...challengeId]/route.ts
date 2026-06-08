// app/api/challenges/[challengeId]/attempts/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string[] }> }
) {
  try {
    const { challengeId } = await params;

    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Obtener datos del body
    const body = await req.json();
    const { problem_id, score, milliseconds } = body;

    console.log("Received attempt data:", { problem_id, score, milliseconds });

    if (!problem_id || score === undefined || !milliseconds) {
      return Response.json({ 
        error: 'Faltan campos requeridos: problem_id, score, milliseconds' 
      }, { status: 400 });
    }

    const db = await connectDB();
    const userId = session.user.email; // o usa session.user.id si tienes

    // 3. Insertar en challenge_attempts
    const attempt = {
      user_id: userId,
      problem_id: problem_id,
      score: score,
      milliseconds: milliseconds,
      challenge_id: challengeId[0],
      created_at: new Date()
    };

    await db.collection('challenge_attempts').insertOne(attempt);

    // 4. Obtener o crear challenge_status
    let status = await db.collection('challenge_status').findOne({
      user_id: userId,
      problem_id: problem_id,
      challenge_id: challengeId[0]
    });

    let intent_number = 1;
    let totalMilliseconds = milliseconds;
    let averageMilliseconds = milliseconds;

    if (status) {
      // Actualizar existente
      intent_number = status.intent_number + 1;
      totalMilliseconds = status.totalMilliseconds + milliseconds;
      averageMilliseconds = totalMilliseconds / intent_number;
      
      // Calcular estrellas con la fórmula
      const stars = calculateStars(
        averageMilliseconds, 
        intent_number, 
        milliseconds, 
        score
      );

      // Actualizar documento
      await db.collection('challenge_status').updateOne(
        { 
          user_id: userId, 
          problem_id: problem_id,
          challenge_id: challengeId[0] 
        },
        {
          $set: {
            intent_number: intent_number,
            averageMilliseconds: averageMilliseconds,
            totalMilliseconds: totalMilliseconds,
            stars: stars,
            last_attempt_at: new Date()
          }
        }
      );
    } else {
      // Insertar nuevo
      const stars = calculateStars(
        averageMilliseconds, 
        intent_number, 
        milliseconds, 
        score
      );

      const newStatus = {
        user_id: userId,
        problem_id: problem_id,
        challenge_id: challengeId[0],
        intent_number: intent_number,
        averageMilliseconds: averageMilliseconds,
        totalMilliseconds: totalMilliseconds,
        stars: stars,
        created_at: new Date(),
        updated_at: new Date()
      };

      await db.collection('challenge_status').insertOne(newStatus);
    }

    // 5. Obtener el estado actualizado para responder
    const updatedStatus = await db.collection('challenge_status').findOne({
      user_id: userId,
      problem_id: problem_id,
      challenge_id: challengeId[0]
    });

    return Response.json({
      ok: true,
      attempt: attempt,
      status: updatedStatus
    });

  } catch (error) {
    console.error("Error en POST /api/challenges/[challengeId]/attempts:", error);
    return Response.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// Función para calcular estrellas según la fórmula
function calculateStars(
  averageMilliseconds: number, 
  intent_number: number, 
  milliseconds: number, 
  score: number
): number {
  // Fórmula: (averageMilliseconds * intent_number * 3)/30000 + milliseconds / 2000 + score / 10
  const stars = 
    (averageMilliseconds * intent_number * 3) / 30000 +
    milliseconds / 2000 +
    score / 10;
  
  // Redondear a 1 decimal y limitar entre 0 y 5
  let roundedStars = Math.round(stars * 10) / 10;
  roundedStars = Math.max(0, Math.min(5, roundedStars));
  
  return roundedStars;
}