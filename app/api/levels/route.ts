import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import {
    getCompletedChallengeIds,
    hasCompletedChallenges,
    normalizeChallengeId,
    resolveChallengeIds,
} from "@/lib/challenge-progress";

export async function GET() {
    try {
        // Obtener sesión del usuario
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return Response.json({ error: 'No autorizado' }, { status: 401 });
        }
        
        const db = await connectDB();
        const user = await db.collection('users').findOne({ _id: new ObjectId(session.user.id) });
        if (!user) {
            console.log("No encontrado", session.user.id)
            return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const levels = await db.collection('levels').find().sort({ order: 1 }).toArray();
        const challengeIds = await db.collection('challenges')
            .find({}, { projection: { _id: 1 } })
            .toArray()
            .then(challenges => challenges.map(challenge => challenge._id));

        const challengesStatus = await db.collection('challenge_status')
            .find({ userId: { $in: [user._id, user._id.toString()] } })
            .toArray();
        const completedChallengeIds = getCompletedChallengeIds(challengesStatus);

        const levelsMap = levels.map((level, index) => {
            const resolvedLevelChallengeIds = resolveChallengeIds(level.problemIds, challengeIds);
            const levelChallengeIdSet = new Set(resolvedLevelChallengeIds.map(normalizeChallengeId));
            const levelChallengesStatus = challengesStatus.filter(status =>
                levelChallengeIdSet.has(normalizeChallengeId(status.challengeId))
            );
            const previousLevel = index > 0 ? levels[index - 1] : undefined;
            const previousChallengeIds = resolveChallengeIds(previousLevel?.problemIds, challengeIds);
            return {
                _id: level._id,
                title: level.title,
                order: level.order,
                starts: Math.min(
                    3,
                    levelChallengesStatus.reduce(
                        (total, status) => total + (Math.max(0, Number(status.stars) || 0)),
                        0
                    )
                ),
                unlocked: !previousLevel ||
                    hasCompletedChallenges(previousChallengeIds, completedChallengeIds)
            }
        });

        return Response.json({ levels: levelsMap }, { status: 200 });        
    } catch (error) {
        console.error("Error fetching levels:", error);
        return new Response("Error fetching levels", { status: 500 });
    }
}