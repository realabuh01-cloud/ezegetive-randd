import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ user: null }, { status: 401 });

    const userRows = await db.select().from(users).where(eq(users.id, payload.id)).limit(1);
    if (userRows.length === 0) return NextResponse.json({ user: null }, { status: 401 });

    const u = userRows[0];
    return NextResponse.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
