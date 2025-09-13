import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

// ✅ GET: List all users
export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, country, state, city, address1, address2, zip, created_at, updated_at 
       FROM users`
    );
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ✅ POST: Create a new user (you already did this, unchanged)
export async function POST(req: NextRequest) {
  const {
    name,
    email,
    phone,
    country,
    state,
    city,
    address1,
    address2,
    zip
  } = await req.json();

  try {
    const [result]: any = await pool.query(
      `INSERT INTO users 
       (name, email, phone, country, state, city, address1, address2, zip) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, country, state, city, address1, address2, zip]
    );

    return NextResponse.json({
      id: result.insertId,
      name,
      email,
      phone,
      country,
      state,
      city,
      address1,
      address2,
      zip
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ✅ PUT: Update a user
export async function PUT(req: NextRequest) {
  const {
    id,
    name,
    email,
    phone,
    country,
    state,
    city,
    address1,
    address2,
    zip
  } = await req.json();

  try {
    await pool.query(
      `UPDATE users 
       SET name=?, email=?, phone=?, country=?, state=?, city=?, address1=?, address2=?, zip=?, updated_at=NOW() 
       WHERE id=?`,
      [name, email, phone, country, state, city, address1, address2, zip, id]
    );

    return NextResponse.json({
      id,
      name,
      email,
      phone,
      country,
      state,
      city,
      address1,
      address2,
      zip
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ✅ DELETE: Delete a user
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  try {
    await pool.query('DELETE FROM users WHERE id=?', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
