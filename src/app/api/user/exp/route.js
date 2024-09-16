import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('id');
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({exp: user.exp}), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user' }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('id');
    const { amount } = await req.json(); // Ambil amount dari request body
    
    if (!userId || amount === undefined) {
      return new Response(JSON.stringify({ error: 'User ID and amount are required' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userCollection = db.collection('users');

    // Update balance
    const result = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { exp: amount } } // Menambah atau mengurangi balance
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update exp' }), { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('id');
    const { amount } = await req.json(); // Ambil amount dari request body
    
    if (!userId || amount === undefined) {
      return new Response(JSON.stringify({ error: 'User ID and amount are required' }), { status: 400 });
    }

    if (amount <= 0) {
      return new Response(JSON.stringify({ error: 'Amount must be greater than zero' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userCollection = db.collection('users');

    // Kurangi balance
    const result = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { exp: -amount } } // Mengurangi balance
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update exp' }), { status: 500 });
  }
}

