import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cartItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { quantity } = await req.json();
    if (quantity < 1) {
      await db.delete(cartItems).where(and(eq(cartItems.id, Number(id)), eq(cartItems.userId, payload.id)));
      return NextResponse.json({ ok: true });
    }

    const updated = await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, Number(id)), eq(cartItems.userId, payload.id)))
      .returning();

    return NextResponse.json({ item: updated[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await db.delete(cartItems).where(and(eq(cartItems.id, Number(id)), eq(cartItems.userId, payload.id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
