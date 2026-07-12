import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
    return NextResponse.json({ products: allProducts });
  } catch (err) {
    console.error("Products fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const { name, description, price, image, category, stock } = await req.json();
    if (!name || !price) return NextResponse.json({ error: "Name and price required" }, { status: 400 });

    const inserted = await db
      .insert(products)
      .values({
        name,
        description: description || "",
        price: String(price),
        image: image || "",
        category: category || "General",
        stock: stock ?? 0,
      })
      .returning();

    return NextResponse.json({ product: inserted[0] }, { status: 201 });
  } catch (err) {
    console.error("Product create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
