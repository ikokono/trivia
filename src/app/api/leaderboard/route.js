import clientPromise from '../../../../lib/mongodb';
import { getExperienceForLevel, getLevelFromExperience } from '../../../../utils/levelUtils';

export async function GET(req) {
    const client = await clientPromise;
    const db = client.db();

    // Ambil semua pengguna dari database
    const users = await db.collection('users').find().toArray();

    // Hitung level untuk setiap pengguna
    const leaderboard = users.map(user => ({
        ...user,
        level: getLevelFromExperience(user.exp || 0),
    })).sort((a, b) => b.exp - a.exp); // Mengurutkan berdasarkan EXP

    return new Response(JSON.stringify(leaderboard), { status: 200 });
}
