import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

// GET: List all users
export async function GET() {
  const [rows] = await pool.query('SELECT id, email, name, created_at, updated_at FROM users');
  return NextResponse.json(rows);
}

// POST: Create a new user
export async function POST(req: NextRequest) {
  const { email, name, password } = await req.json();
  try {
    const [result]: any = await pool.query(
      'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
      [email, name, password]
    );
    console.log('result', result);
    return NextResponse.json({ id: result.insertId, email, name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PUT: Update a user
export async function PUT(req: NextRequest) {
  const { id, email, name, password } = await req.json();
  try {
    await pool.query(
      'UPDATE users SET email=?, name=?, password=? WHERE id=?',
      [email, name, password, id]
    );
    return NextResponse.json({ id, email, name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE: Delete a user
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  try {
    await pool.query('DELETE FROM users WHERE id=?', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}