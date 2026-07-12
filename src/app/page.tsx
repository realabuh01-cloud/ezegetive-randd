"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);

    if ((data.products || []).length === 0 && !seeded) {
      setSeeded(true);
      await fetch("/api/seed", { method: "POST" });
      const res2 = await fetch("/api/products");
      const data2 = await res2.json();
      setProducts(data2.products || []);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToCart = async (productId: number) => {
    setAddingId(productId);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    const data = await res.json();
    if (res.ok) {
      setToast("✓ Added to cart!");
    } else {
      setToast(data.error || "Failed to add");
    }
    setTimeout(() => setToast(""), 2500);
    setAddingId(null);
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="bg-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl font-semibold animate-slide-in">
          {toast}
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-banner.jpg"
            alt="Ezegetive Retail and Distribution"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/80 to-green-900/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-100 text-sm font-medium">Now Open — Shop Online 24/7</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Ezegetive<br />
              <span className="text-green-300">Retail &amp; Distribution</span>
            </h1>
            <p className="text-green-100 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
              Your trusted partner for quality products at wholesale prices.
              Fresh groceries, premium brands, and lightning-fast delivery.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#products"
                className="px-8 py-4 bg-white text-green-800 rounded-2xl font-bold text-lg hover:bg-green-50 transition shadow-xl shadow-green-900/20"
              >
                Shop Now →
              </a>
              <a
                href="/signup"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition"
              >
                Join Today
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-0 md:divide-x divide-green-500">
            {[
              { icon: "🚚", text: "Free Delivery $50+" },
              { icon: "⭐", text: "Premium Quality" },
              { icon: "💰", text: "Wholesale Prices" },
              { icon: "🔒", text: "Secure Checkout" },
            ].map((f) => (
              <div key={f.text} className="flex items-center justify-center gap-3 py-2 px-4">
                <span className="text-2xl">{f.icon}</span>
                <span className="font-semibold text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-3">
            Our Products
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Browse our carefully curated selection of premium products
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white focus:outline-none transition text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                  category === cat
                    ? "bg-green-600 text-white shadow-md shadow-green-200"
                    : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700 border border-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-400 font-medium">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-semibold">No products found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <div
                key={product.id}
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="relative h-56 bg-gray-50 overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                      📦
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {product.category}
                    </span>
                  </div>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-green-700">
                        <del>N</del>{Number(product.price).toFixed(2)}
                      </span>
                      {product.stock > 0 && (
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                          {product.stock} in stock
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0 || addingId === product.id}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                        product.stock === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : addingId === product.id
                          ? "bg-green-100 text-green-600"
                          : "bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-md shadow-green-200"
                      }`}
                    >
                      {addingId === product.id ? "Adding..." : product.stock === 0 ? "Sold Out" : "+ Add"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Join Ezegetive Today
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-lg mx-auto">
            Create your free account and start shopping with wholesale prices, fast delivery, and premium quality products.
          </p>
          <a
            href="/signup"
            className="inline-block px-10 py-4 bg-white text-green-700 rounded-2xl font-bold text-lg hover:bg-green-50 transition shadow-xl"
          >
            Create Free Account
          </a>
        </div>
      </section>
    </div>
  );
}
