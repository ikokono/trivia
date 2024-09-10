import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    // Ambil ID dari query string
    const url = new URL(req.url);
    const userId = url.searchParams.get('id');
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Temukan pengguna dengan ID yang diberikan
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ username: user.username }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user' }), { status: 500 });
  }
}
