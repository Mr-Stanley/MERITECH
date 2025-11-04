import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET all categories
export async function GET() {
  try {
    // Check if database is configured
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json(
        { 
          error: "Database not configured",
          message: "POSTGRES_URL environment variable is missing. Please configure your database connection."
        },
        { status: 500 }
      );
    }

    const { rows } = await sql`
      SELECT * FROM categories ORDER BY created_at ASC
    `;

    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    
    // Check for common database connection errors
    let errorMessage = "Internal server error";
    if (error.message?.includes("connect") || error.message?.includes("ECONNREFUSED")) {
      errorMessage = "Database connection failed. Please check your database configuration.";
    } else if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
      errorMessage = "Database tables not found. Please run the database setup SQL commands.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? String(error) : undefined 
      },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const { name } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      INSERT INTO categories (name)
      VALUES (${name.trim()})
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
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(request: NextRequest) {
  try {
    await requireAuth();

    const { id, name } = await request.json();

    if (!id || !name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category ID and name are required" },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      UPDATE categories
      SET name = ${name.trim()}
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
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
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM categories WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

