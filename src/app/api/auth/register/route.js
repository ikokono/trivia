import clientPromise from '../../../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setCookie } from 'nookies';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const client = await clientPromise;
    const db = client.db();
    
    // Cek apakah user sudah ada
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const result = await db.collection('users').insertOne({
      username,
      password: hashedPassword,
      avatar: "/images/driver_komeng.png",
    });

    const userId = result.insertedId;

    // Generate token JWT
    const token = jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return new Response(JSON.stringify({ message: 'User registered successfully', token }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
