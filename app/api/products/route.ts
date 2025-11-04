import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status") || "active";

    let query;
    if (categoryId) {
      query = sql`
        SELECT p.*, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ${parseInt(categoryId)} AND p.status = ${status}
        ORDER BY p.created_at DESC
      `;
    } else {
      query = sql`
        SELECT p.*, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.status = ${status}
        ORDER BY p.created_at DESC
      `;
    }

    const { rows } = await query;

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create product
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const { name, description, price, image_url, category_id, status } =
      await request.json();

    if (!name || !price || !category_id) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    const productStatus = status || "active";

    const { rows } = await sql`
      INSERT INTO products (name, description, price, image_url, category_id, status)
      VALUES (${name.trim()}, ${description || null}, ${parseFloat(price)}, ${image_url || null}, ${parseInt(category_id)}, ${productStatus})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request: NextRequest) {
  try {
    await requireAuth();

    const { id, name, description, price, image_url, category_id, status } =
      await request.json();

    if (!id || !name || !price || !category_id) {
      return NextResponse.json(
        { error: "ID, name, price, and category are required" },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      UPDATE products
      SET name = ${name.trim()},
          description = ${description || null},
          price = ${parseFloat(price)},
          image_url = ${image_url || null},
          category_id = ${parseInt(category_id)},
          status = ${status || "active"},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM products WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

