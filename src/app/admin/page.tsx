"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user?.role === "admin") {
          setIsAdmin(true);
        } else {
          router.push("/");
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-3xl p-8 md:p-12 text-white mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
              <p className="text-green-200 text-sm">Ezegetive Retail &amp; Distribution</p>
            </div>
          </div>
          <p className="text-green-100 max-w-lg">
            Manage your products, process orders, and keep your store running smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/products"
            className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-green-300 hover:shadow-xl hover:shadow-green-100/50 transition-all group"
          >
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-green-100 transition">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-700 transition">
              Manage Products
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Add new products with images, edit prices and stock, or remove items from your catalog.
            </p>
            <div className="mt-4 text-green-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Open Products Manager <span>→</span>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-green-300 hover:shadow-xl hover:shadow-green-100/50 transition-all group"
          >
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-green-100 transition">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-700 transition">
              Manage Orders
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              View incoming customer orders, update status, and process shipments manually.
            </p>
            <div className="mt-4 text-green-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Open Orders Manager <span>→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
