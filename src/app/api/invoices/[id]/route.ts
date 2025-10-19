import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const [rows]: any = await pool.query(
      `SELECT id, invoice_id, status, invoice_to, invoice_details, sub_total, shipping, discount, taxes, total, created_at, updated_at 
       FROM invoices WHERE id = ?`,
      [id]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}