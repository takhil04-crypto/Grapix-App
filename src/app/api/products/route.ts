import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

// ✅ GET: List all products
export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT id, product_name, sub_description, content, images, properties, pricing, publish_status, created_at, updated_at 
       FROM products`
    );
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}


// ✅ POST: Create a new product
export async function POST(req: NextRequest) {
  const {
    product_name,
    sub_description,
    content,
    images,
    properties,
    pricing,
    publish_status
  } = await req.json();

  try {
    const [result]: any = await pool.query(
      `INSERT INTO products 
       (product_name, sub_description, content, images, properties, pricing, publish_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product_name,
        sub_description,
        content,
        JSON.stringify(images || []),
        JSON.stringify(properties || {}),
        JSON.stringify(pricing || {}),
        publish_status || 'draft'
      ]
    );

    return NextResponse.json({
      id: result.insertId,
      product_name,
      sub_description,
      content,
      images,
      properties,
      pricing,
      publish_status: publish_status || 'draft'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ✅ PUT: Update a product
export async function PUT(req: NextRequest) {
  const {
    id,
    product_name,
    sub_description,
    content,
    images,
    properties,
    pricing,
    publish_status
  } = await req.json();

  try {
    await pool.query(
      `UPDATE products 
       SET product_name=?, sub_description=?, content=?, images=?, properties=?, pricing=?, publish_status=?, updated_at=NOW() 
       WHERE id=?`,
      [
        product_name,
        sub_description,
        content,
        JSON.stringify(images || []),
        JSON.stringify(properties || {}),
        JSON.stringify(pricing || {}),
        publish_status,
        id
      ]
    );

    return NextResponse.json({
      id,
      product_name,
      sub_description,
      content,
      images,
      properties,
      pricing,
      publish_status
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ✅ DELETE: Delete a product
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  try {
    await pool.query('DELETE FROM products WHERE id=?', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
