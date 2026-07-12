"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

const emptyForm = { name: "", description: "", price: "", image: "", category: "General", stock: 0 };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user?.role !== "admin") { router.push("/"); return; }
        setIsAdmin(true);
      } else { router.push("/login"); return; }
      fetchProducts();
    };
    init();
  }, [router]);

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };

    if (editId) {
      const res = await fetch(`/api/products/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) showToast("✓ Product updated!");
    } else {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) showToast("✓ Product added!");
    }

    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    setForm({ name: product.name, description: product.description, price: product.price, image: product.image, category: product.category, stock: product.stock });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product permanently?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    showToast("✓ Product deleted");
    fetchProducts();
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-green-600 hover:underline text-sm font-semibold mb-1 inline-block">← Back to Admin</Link>
            <h1 className="text-3xl font-extrabold text-gray-800">Manage Products</h1>
            <p className="text-gray-500 text-sm mt-1">{products.length} product{products.length !== 1 && "s"} in catalog</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition shadow-lg ${
              showForm ? "bg-gray-200 text-gray-700 shadow-none" : "bg-green-600 text-white shadow-green-200 hover:bg-green-700"
            }`}
          >
            {showForm ? "✕ Cancel" : "+ Add New Product"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 mb-8 shadow-lg animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{editId ? "Edit Product" : "Add New Product"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white focus:outline-none text-sm" placeholder="e.g. Organic Rice (5kg)" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (N) *</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white focus:outline-none text-sm" placeholder="999" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white focus:outline-none text-sm" placeholder="e.g. Groceries, Dairy, Beverages" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white focus:outline-none text-sm" placeholder="100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white focus:outline-none text-sm" placeholder="https://images.pexels.com/..." />
                {form.image && (
                  <div className="mt-3 relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                    <Image src={form.image} alt="Preview" fill className="object-cover" sizes="80px" />
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white focus:outline-none text-sm resize-none" placeholder="Describe your product..." />
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={saving}
                  className="bg-green-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-green-700 transition disabled:opacity-50 shadow-lg shadow-green-200">
                  {saving ? "Saving..." : editId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="font-semibold">No products yet</p>
              <p className="text-sm mt-1">Click &quot;Add New Product&quot; to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                            {product.image ? (
                              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="56px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">📦</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">{product.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-lg font-semibold">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-green-700">${Number(product.price).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold text-sm ${product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-yellow-600" : "text-red-500"}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(product)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
