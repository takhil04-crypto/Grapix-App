import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      `SELECT invoice_id FROM invoices ORDER BY id DESC LIMIT 1`
    );
    let nextNumber = 1001;
    if (rows.length > 0 && rows[0].invoice_id) {
      const match = rows[0].invoice_id.match(/INV-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    return NextResponse.json({ nextInvoiceId: `INV-${nextNumber}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}