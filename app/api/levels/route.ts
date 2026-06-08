import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";

export async function GET(req: Request) { 
    try {
        // Obtener sesión del usuario
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return Response.json({ error: 'No autorizado' }, { status: 401 });
        }
        
        const db = await connectDB();
        const user = await db.collection('users').findOne({ email: session.user.email });
        if (!user) {
            return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const levels = await db.collection('levels').find().toArray();

        const challengesStatus = await db.collection('challenges_status').find({ userId: user._id }).toArray();

        const levelsMap = levels.map(level => {
            const levelChallengesStatus = challengesStatus.find(challenge => challenge.levelId.toString() === level._id.toString());
            return {
                _id: level._id,
                title: level.title,
                order: level.order,
                starts: levelChallengesStatus?.stars ?? 0,
                unlocked: levelChallengesStatus?.unlocked || (!levelChallengesStatus && level.order === 1)
            }
        });

        return Response.json({ levels: levelsMap }, { status: 200 });        
    } catch (error) {
        console.error("Error fetching levels:", error);
        return new Response("Error fetching levels", { status: 500 });
    }
}