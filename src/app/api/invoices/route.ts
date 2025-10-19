import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

// ✅ GET: List all invoices
export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT id, invoice_id, status, invoice_to, invoice_details, sub_total, shipping, discount, taxes, total, created_at, updated_at 
       FROM invoices`
    );
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ✅ POST: Create a new invoice
export async function POST(req: NextRequest) {
  const {
    invoice_id,
    status,
    invoice_to,
    invoice_details,
    sub_total,
    shipping,
    discount,
    taxes,
    total
  } = await req.json();

  try {
    const [result]: any = await pool.query(
      `INSERT INTO invoices 
       (invoice_id, status, invoice_to, invoice_details, sub_total, shipping, discount, taxes, total) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_id,
        status,
        invoice_to,
        JSON.stringify(invoice_details),
        sub_total,
        shipping,
        discount,
        taxes,
        total
      ]
    );

    return NextResponse.json({
      id: result.insertId,
      invoice_id,
      status,
      invoice_to,
      invoice_details,
      sub_total,
      shipping,
      discount,
      taxes,
      total
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ✅ PUT: Update an invoice
export async function PUT(req: NextRequest) {
  const {
    id,
    invoice_id,
    status,
    invoice_to,
    invoice_details,
    sub_total,
    shipping,
    discount,
    taxes,
    total
  } = await req.json();

  try {
    await pool.query(
      `UPDATE invoices 
       SET invoice_id=?, status=?, invoice_to=?, invoice_details=?, sub_total=?, shipping=?, discount=?, taxes=?, total=?, updated_at=NOW() 
       WHERE id=?`,
      [
        invoice_id,
        status,
        invoice_to,
        JSON.stringify(invoice_details),
        sub_total,
        shipping,
        discount,
        taxes,
        total,
        id
      ]
    );

    return NextResponse.json({
      id,
      invoice_id,
      status,
      invoice_to,
      invoice_details,
      sub_total,
      shipping,
      discount,
      taxes,
      total
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ✅ DELETE: Delete an invoice
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
    await pool.query(
      `DELETE FROM invoices WHERE id IN (${placeholders})`,
      ids
    );
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}