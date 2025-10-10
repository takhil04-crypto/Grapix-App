import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

// ✅ GET: List all customers
export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, country, state, city, address1, address2, zip, created_at, updated_at 
       FROM customers`
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
      `INSERT INTO customers 
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
      `UPDATE customers 
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
    // Support both single id and array of ids
    const ids = Array.isArray(id) ? id : [id];
    if (!ids.length) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }
    // Create placeholders for the number of ids
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(`DELETE FROM customers WHERE id IN (${placeholders})`, ids);
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
