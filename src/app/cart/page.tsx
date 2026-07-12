"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  productName: string;
  productPrice: string;
  productImage: string;
  productStock: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) {
      await removeItem(id);
      return;
    }
    await fetch(`/api/cart/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    fetchCart();
  };

  const removeItem = async (id: number) => {
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    fetchCart();
  };

  const total = items.reduce((sum, item) => sum + Number(item.productPrice) * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:underline text-sm font-semibold mb-2 inline-block">
            ← Continue Shopping
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-800">Shopping Cart</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} item{items.length !== 1 && "s"}</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Browse our products and add items to your cart</p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 hover:shadow-md transition"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 relative">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">📦</div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-gray-800">{item.productName}</h3>
                    <p className="text-green-600 font-extrabold text-lg">${Number(item.productPrice).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold transition"
                    >
                      −
                    </button>
                    <span className="text-base font-bold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold transition"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right flex sm:flex-col items-center sm:items-end gap-3">
                    <p className="font-extrabold text-gray-800">
                      ${(Number(item.productPrice) * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
                <h2 className="font-bold text-gray-800 text-lg mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="font-semibold text-gray-700">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span className="font-semibold text-green-600">{total >= 50 ? "FREE" : "$5.00"}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-extrabold text-green-700">
                      ${(total + (total >= 50 ? 0 : 5)).toFixed(2)}
                    </span>
                  </div>
                </div>
                {total < 50 && (
                  <p className="text-xs text-green-600 bg-green-50 rounded-xl p-3 mt-4 font-medium">
                    💡 Add ${(50 - total).toFixed(2)} more for free delivery!
                  </p>
                )}
                <Link
                  href="/checkout"
                  className="block w-full bg-green-600 text-white text-center py-4 rounded-2xl font-bold text-base hover:bg-green-700 transition mt-6 shadow-lg shadow-green-200"
                >
                  Proceed to Checkout →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
