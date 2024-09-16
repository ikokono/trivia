import clientPromise from '../../../../../lib/mongodb';
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

    // Jika tidak ada items, kembalikan user dengan array kosong
    if (!user.items || user.items.length === 0) {
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    }

    // Temukan detail item berdasarkan ID
    const itemIds = user.items.map(itemId => new ObjectId(itemId));
    const items = await db.collection('items').find({ _id: { $in: itemIds } }).toArray();

    return new Response(JSON.stringify({ items }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user' }), { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    // Ambil ID dari query string
    const url = new URL(req.url);
    const userId = url.searchParams.get('id');
    const itemId = url.searchParams.get('itemId');
    
    if (!userId || !itemId) {
      return new Response(JSON.stringify({ error: 'User ID and Item ID are required' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Hapus item dari array items dalam dokumen pengguna
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { items: new ObjectId(itemId) } }
    );

    if (result.modifiedCount === 0) {
      return new Response(JSON.stringify({ error: 'Item not found in user\'s items' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Item removed from user successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to remove item from user' }), { status: 500 });
  }
}

export async function PUT(req) {
    try {
      // Ambil ID dari query string
      const url = new URL(req.url);
      const userId = url.searchParams.get('id');
      const itemId = url.searchParams.get('itemId');
      
      if (!userId || !itemId) {
        return new Response(JSON.stringify({ error: 'User ID and Item ID are required' }), { status: 400 });
      }
  
      const client = await clientPromise;
      const db = client.db();
  
      // Temukan pengguna dengan ID yang diberikan
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
      }
  
      // Temukan item dengan ID yang diberikan
      const item = await db.collection('items').findOne({ _id: new ObjectId(itemId) });
      if (!item) {
        return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 });
      }
  
      // Validasi apakah user memiliki cukup balance
      if (user.balance < item.price) {
        return new Response(JSON.stringify({ error: 'Insufficient balance' }), { status: 400 });
      }
  
      // Kurangi balance user
      const newBalance = user.balance - item.price;
  
      // Tambahkan item ke array items dalam dokumen pengguna dan perbarui balance
      const result = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $addToSet: { items: new ObjectId(itemId) }, // $addToSet memastikan item tidak duplikat
          $set: { balance: newBalance }
        }
      );
  
      if (result.modifiedCount === 0) {
        return new Response(JSON.stringify({ error: 'Failed to add item to user\'s items or update balance' }), { status: 400 });
      }
  
      return new Response(JSON.stringify({ message: 'Item purchased and balance updated successfully' }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to process purchase' }), { status: 500 });
    }
  }
  
