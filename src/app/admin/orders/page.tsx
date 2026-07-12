"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: string;
  productName: string;
  productImage: string;
}

interface Order {
  id: number;
  userId: number;
  total: string;
  status: string;
  address: string;
  phone: string;
  customerName: string;
  actualCustomerName: string;
  customerEmail: string;
  processed: boolean;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user?.role !== "admin") { router.push("/"); return; }
        setIsAdmin(true);
      } else { router.push("/login"); return; }
      fetchOrders();
    };
    init();
  }, [router]);

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const updateOrder = async (id: number, status: string, processed: boolean) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, processed }),
    });
    if (res.ok) {
      showToast(`✓ Order #${id} → ${status}`);
      fetchOrders();
    }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-purple-50 text-purple-700 border-purple-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {toast && (
          <div className="fixed top-24 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl font-semibold animate-slide-in">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-green-600 hover:underline text-sm font-semibold mb-1 inline-block">← Back to Admin</Link>
          <h1 className="text-3xl font-extrabold text-gray-800">Manage Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Process customer orders manually</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition capitalize ${
                filter === s ? "bg-green-600 text-white shadow-md shadow-green-200" : "bg-white text-gray-600 border border-gray-100 hover:border-green-300"
              }`}
            >
              {s} {s !== "all" && <span className="text-xs opacity-70">({orders.filter((o) => s === "all" || o.status === s).length})</span>}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 font-semibold">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">Orders will appear here when customers place them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                {/* Order Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${
                        order.processed ? "bg-green-500" : order.status === "pending" ? "bg-yellow-500 animate-pulse" : order.status === "shipped" ? "bg-blue-500" : "bg-gray-400"
                      }`} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-800">Order #{order.id}</h3>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase border ${statusColors[order.status] || "bg-gray-50 text-gray-600"}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.actualCustomerName || order.customerName} • {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-green-700 text-lg">${Number(order.total).toFixed(2)}</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === order.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === order.id && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-5 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <h4 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wider">📍 Delivery Info</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600"><span className="font-semibold text-gray-700">Customer:</span> {order.actualCustomerName || order.customerName}</p>
                          {order.customerEmail && <p className="text-gray-600"><span className="font-semibold text-gray-700">Email:</span> {order.customerEmail}</p>}
                          <p className="text-gray-600"><span className="font-semibold text-gray-700">Phone:</span> {order.phone}</p>
                          <p className="text-gray-600"><span className="font-semibold text-gray-700">Address:</span> {order.address}</p>
                          <p className="text-gray-600">
                            <span className="font-semibold text-gray-700">Processed:</span>{" "}
                            <span className={order.processed ? "text-green-600 font-bold" : "text-yellow-600 font-bold"}>
                              {order.processed ? "Yes ✅" : "Pending ⏳"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-5">
                        <h4 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wider">📦 Items</h4>
                        <div className="space-y-3">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 relative">
                                {item.productImage ? (
                                  <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="40px" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-300">📦</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-700 truncate">{item.productName}</p>
                                <p className="text-xs text-gray-400">× {item.quantity}</p>
                              </div>
                              <span className="font-bold text-sm text-green-700">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updateOrder(order.id, "confirmed", false)}
                        className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 transition border border-blue-100">
                        ✓ Confirm
                      </button>
                      <button onClick={() => updateOrder(order.id, "shipped", false)}
                        className="px-5 py-2.5 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-100 transition border border-purple-100">
                        🚚 Ship
                      </button>
                      <button onClick={() => updateOrder(order.id, "delivered", true)}
                        className="px-5 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-bold hover:bg-green-100 transition border border-green-100">
                        ✅ Mark Delivered
                      </button>
                      <button onClick={() => updateOrder(order.id, "cancelled", false)}
                        className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition border border-red-100">
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
