import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ items: [] });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ items: [] });

    const items = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        productName: products.name,
        productPrice: products.price,
        productImage: products.image,
        productStock: products.stock,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, payload.id));

    return NextResponse.json({ items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Please sign in to add items to cart" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Please sign in to add items to cart" }, { status: 401 });

    const { productId, quantity } = await req.json();
    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, payload.id), eq(cartItems.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + (quantity || 1) })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return NextResponse.json({ item: updated[0] });
    }

    const inserted = await db
      .insert(cartItems)
      .values({ userId: payload.id, productId, quantity: quantity || 1 })
      .returning();

    return NextResponse.json({ item: inserted[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
