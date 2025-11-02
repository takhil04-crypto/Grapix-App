import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

// ✅ GET: List all invoices
export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT 
         i.id, i.invoice_id, i.status, i.invoice_to, i.invoice_details, i.sub_total, i.shipping, i.discount, i.taxes, i.total, i.created_at, i.updated_at,
         c.id AS customer_id, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone, c.country AS customer_country, c.state AS customer_state, c.city AS customer_city, c.address1 AS customer_address1, c.address2 AS customer_address2, c.zip AS customer_zip, c.status AS customer_status, c.created_at AS customer_created_at, c.updated_at AS customer_updated_at
       FROM invoices i
       LEFT JOIN customers c ON i.invoice_to = c.id`
    );

    // Ensure rows is an array before mapping
    const formatted = Array.isArray(rows)
      ? rows.map((row: any) => ({
          id: row.id,
          invoice_id: row.invoice_id,
          status: row.status,
          invoice_to: row.invoice_to,
          invoice_details: row.invoice_details,
          sub_total: row.sub_total,
          shipping: row.shipping,
          discount: row.discount,
          taxes: row.taxes,
          total: row.total,
          created_at: row.created_at,
          updated_at: row.updated_at,
          customer: {
            id: row.customer_id,
            name: row.customer_name,
            email: row.customer_email,
            phone: row.customer_phone,
            country: row.customer_country,
            state: row.customer_state,
            city: row.customer_city,
            address1: row.customer_address1,
            address2: row.customer_address2,
            zip: row.customer_zip,
            status: row.customer_status,
            created_at: row.customer_created_at,
            updated_at: row.customer_updated_at,
          }
        }))
      : [];

    return NextResponse.json(formatted);
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
        JSON.stringify(invoice_to),
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
        JSON.stringify(invoice_to),
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