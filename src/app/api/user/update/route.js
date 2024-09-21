import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
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

    // Ambil data dari body request
    const { username, avatarUrl, bio } = await req.json();

    // Object untuk menyimpan data perubahan
    const updateData = {};

    // Tambahkan pengecekan username jika ada
    if (username) {
      // Periksa apakah username sudah digunakan oleh pengguna lain
      const existingUser = await db.collection('users').findOne({ username, _id: { $ne: new ObjectId(userId) } });
      
      if (existingUser) {
        return new Response(JSON.stringify({ error: 'This username has been taken' }), { status: 400 });
      }
      
      updateData.username = username;
    }

    // Tambahkan perubahan ke object jika ada
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (bio) updateData.bio = bio;

    // Jika tidak ada perubahan yang diberikan, kembalikan error
    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid data provided for update' }), { status: 400 });
    }

    // Update profil pengguna
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    // Ambil user yang telah diperbarui
    const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to update user profile' }), { status: 500 });
  }
}
