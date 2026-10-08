// app/api/challenges/[challengeId]/attempts/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { normalizeChallengeId } from "@/lib/challenge-progress";

type ChallengeDocument = {
  _id: string;
  milliseconds: number;
  expectedAverageMilliseconds?: number;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  try {
    const { challengeId } = await params;

    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    console.log("Session data:", session);
    if (!session?.user?.id) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Obtener datos del body
    const body = await req.json();
    const { levelId, averageTimeMs, score } = body;

    console.log("Received attempt data:", { levelId, averageTimeMs, score });

    if (!averageTimeMs || score === undefined || !levelId) {
      return Response.json({ 
        error: 'Faltan campos requeridos: problem_id, score, averageTimeMs, stars' 
      }, { status: 400 });
    }

    const db = await connectDB();
    const userId = new ObjectId(session.user.id);

    // 3. Insertar en challenge_attempts
    const attempt = {
      userId,
      score: score,
      averageTimeMs: averageTimeMs,
      levelId: levelId,
      challengeId,
      createdAt: new Date()
    };

    console.log("Attempt to insert:", attempt);

    await db.collection('challenge_attempts').insertOne(attempt);

    // 4. Obtener o crear challenge_status
    const existingStatuses = await db.collection('challenge_status').find({
      userId: { $in: [userId, userId.toString()] },
      levelId: levelId,
    }).toArray();
    const status = existingStatuses.find(
      (existingStatus) =>
        normalizeChallengeId(existingStatus.challengeId) === normalizeChallengeId(challengeId)
    );

    let intentNumber = 1;
    const totalMilliseconds = averageTimeMs;
    let averageMilliseconds = averageTimeMs;
    const problema = await db.collection<ChallengeDocument>('challenges').findOne({ _id: challengeId });
    if(!problema) {
      return NextResponse.json({ ok: false, error: "Problem not found: " + challengeId }, { status: 404 });
    }
    const expectedMs = problema.expectedAverageMilliseconds ?? problema.milliseconds;
    let statusId: ObjectId;
    if (status) {
      statusId = status._id;
      // Actualizar existente
      intentNumber = status.intentNumber + 1;
      const updatedTotalMilliseconds = status.totalMilliseconds + averageTimeMs;
      averageMilliseconds = updatedTotalMilliseconds / intentNumber;

      // Calcular estrellas con la fórmula
      const stars = calculateStars(
        averageMilliseconds, 
        intentNumber, 
        expectedMs
      );

      // Actualizar documento
      await db.collection('challenge_status').updateOne(
        { _id: status._id },
        {
          $set: {
            intentNumber: intentNumber,
            averageMilliseconds: averageMilliseconds,
            totalMilliseconds: updatedTotalMilliseconds,
            stars: stars,
            lastAttemptAt: new Date()
          }
        }
      );
    } else {
      // Insertar nuevo
      const stars = calculateStars(
        averageMilliseconds, 
        intentNumber, 
        expectedMs
      );

      const newStatus = {
        userId: userId,
        levelId: levelId,
        challengeId,
        intentNumber: intentNumber,
        averageMilliseconds: averageMilliseconds,
        totalMilliseconds: totalMilliseconds,
        stars: stars,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const insertResult = await db.collection('challenge_status').insertOne(newStatus);
      statusId = insertResult.insertedId;
    }

    // 5. Obtener el estado actualizado para responder
    const updatedStatus = await db.collection('challenge_status').findOne({ _id: statusId });

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
  correctsRatio: number,
  expectedAverageMilliseconds: number
): number {  
  return Math.floor(averageMilliseconds / expectedAverageMilliseconds * 1.5 
    + correctsRatio * 1.5);  
}