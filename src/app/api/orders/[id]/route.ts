import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const { status, processed } = await req.json();

    const updated = await db
      .update(orders)
      .set({ status: status ?? undefined, processed: processed ?? undefined })
      .where(eq(orders.id, Number(id)))
      .returning();

    if (updated.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order: updated[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
