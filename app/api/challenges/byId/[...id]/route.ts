import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getCompletedChallengeIds,
  hasCompletedChallenges,
  normalizeChallengeId,
  resolveChallengeIds,
} from "@/lib/challenge-progress";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  try {
    const { id } = await params;

    if (!id || !id[0]) {
      return NextResponse.json({ error: "ID del desafío es requerido" }, { status: 400 });
    }
    const entityId = id[0];

    if (!ObjectId.isValid(entityId)) {
      return NextResponse.json({ error: "ID del desafío inválido" }, { status: 400 });
    }

    // Obtener sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const db = await connectDB();
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const level = await db.collection("levels").findOne({ _id: new ObjectId(entityId) });
    if (!level) {
      return NextResponse.json({ error: "Nivel no encontrado" }, { status: 404 });
    }

    const levels = await db.collection("levels").find().sort({ order: 1 }).toArray();
    const levelIndex = levels.findIndex((item) => item._id.toString() === level._id.toString());
    const previousLevel = levelIndex > 0 ? levels[levelIndex - 1] : undefined;
    const problemIds = Array.isArray(level.problemIds) ? level.problemIds : [];

    const challengeDocs = await db.collection("challenges").find().toArray();

    const challengeIds = challengeDocs.map((challenge) => challenge._id);
    const resolvedChallengeIds = resolveChallengeIds(problemIds, challengeIds);
    const challengeById = new Map(challengeDocs.map((c) => [c._id.toString(), c]));
    const challenges = resolvedChallengeIds
      .map((challengeId) => challengeById.get(challengeId))
      .filter((c): c is (typeof challengeDocs)[number] => Boolean(c));
    const previousChallengeIds = resolveChallengeIds(
      previousLevel?.problemIds,
      challengeIds
    );

    const challengesStatus = await db.collection("challenge_status")
      .find({
        userId: { $in: [user._id, user._id.toString()] },
      })
      .toArray();

    const completedChallengeIds = getCompletedChallengeIds(challengesStatus);
    const levelUnlocked =
      !previousLevel ||
      hasCompletedChallenges(previousChallengeIds, completedChallengeIds);
    const starsByChallenge = new Map<string, number>();
    for (const status of challengesStatus) {
      const challengeId = normalizeChallengeId(status.challengeId);
      const stars = Math.max(0, Math.min(3, Math.floor(Number(status.stars) || 0)));
      starsByChallenge.set(
        challengeId,
        Math.max(starsByChallenge.get(challengeId) ?? 0, stars)
      );
    }

    const result = challenges.map((c, index) => {
      const unlocked =
        levelUnlocked &&
        (index === 0 ||
          (starsByChallenge.get(normalizeChallengeId(challenges[index - 1]._id)) ?? 0) >= 2 ||
          (index >= 2 &&
            (starsByChallenge.get(normalizeChallengeId(challenges[index - 2]._id)) ?? 0) >= 3));

      return {
        ...c,
        stars: starsByChallenge.get(normalizeChallengeId(c._id)) ?? 0,
        unlocked,
      };
    });

    return NextResponse.json({ ok: true, challenges: result }, { status: 200 });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json({ error: "Error fetching challenges" }, { status: 500 });
  }
}