import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, cartItems, products, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (payload.role === "admin") {
      const allOrders = await db.select().from(orders).orderBy(orders.createdAt);
      const result = [];
      for (const order of allOrders) {
        const items = await db
          .select({
            id: orderItems.id,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            productName: products.name,
            productImage: products.image,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        const userRows = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
        const customerName = userRows[0]?.name ?? "Unknown";

        result.push({ ...order, items, customerEmail: userRows[0]?.email, actualCustomerName: customerName });
      }
      return NextResponse.json({ orders: result });
    }

    const userOrders = await db.select().from(orders).where(eq(orders.userId, payload.id)).orderBy(orders.createdAt);
    return NextResponse.json({ orders: userOrders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Please sign in first" }, { status: 401 });

    const { address, phone } = await req.json();
    if (!address || !phone) return NextResponse.json({ error: "Address and phone required" }, { status: 400 });

    const cart = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        price: products.price,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, payload.id));

    if (cart.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    const [order] = await db
      .insert(orders)
      .values({
        userId: payload.id,
        total: String(total.toFixed(2)),
        address,
        phone,
        customerName: payload.name,
        status: "pending",
        processed: false,
      })
      .returning();

    for (const item of cart) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    await db.delete(cartItems).where(eq(cartItems.userId, payload.id));

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
