import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request,
  { params }: { params: { id: string } }) { 
    try {
        const { id } = await params;
        
        if(!id) {
            return Response.json({ error: 'ID del desafío es requerido' }, { status: 400 });
        }
        const entityId = id[0];

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

        const level = await db.collection('levels').findOne({ "_id": new ObjectId(entityId) });
        if (!level) {
            return Response.json({ error: 'Nivel no encontrado' }, { status: 404 });
        }

        const challenges = await db.collection('challenges')
            .find({ 
                "_id": { 
                    $in: level.problemIds
                } 
            }).toArray();

        const challengesStatus = await db.collection('challenge_status')
            .find({ 
                "userId": user._id,
                "challengeId": { $in: challenges.map((c) => c._id) }
            }).toArray();
        
        if(!challengesStatus.length) {
            return NextResponse.json({
                ok: true,
                challenges: challenges.map((c: any, index: number) => ({
                    ...c,
                    stars: 0,
                    unlocked: false || index == 0
                }))
             }, { status: 200 });
        }

        return NextResponse.json({ challenges: challenges.map((c: any) => {
            const status = challengesStatus.find((s) => s.challengeId.toString() === c._id.toString());
            return {
                ...c,
                stars: status ? status.stars : 0,                
                unlocked: status ? status.unlocked : false
            };
        }) }, { status: 200 });        
    } catch (error) {
        console.error("Error fetching challenges:", error);
        return new Response("Error fetching challenges", { status: 500 });
    }
}