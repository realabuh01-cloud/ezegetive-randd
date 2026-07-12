import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ezegetive-retail-distribution-secret-2025"
);

export async function signToken(payload: {
  id: number;
  email: string;
  role: string;
  name: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as {
      id: number;
      email: string;
      role: string;
      name: string;
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.id))
    .limit(1);
  if (userRows.length === 0) return null;
  const u = userRows[0];
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}
