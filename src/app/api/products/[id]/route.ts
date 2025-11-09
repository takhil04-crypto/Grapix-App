import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const [rows]: any = await pool.query(
      `SELECT *
       FROM products WHERE id = ?`,
      [id]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}