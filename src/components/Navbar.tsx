"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const count =
          data.items?.reduce(
            (sum: number, item: { quantity: number }) => sum + item.quantity,
            0
          ) ?? 0;
        setCartCount(count);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchCart();
    const interval = setInterval(fetchCart, 4000);

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchUser, fetchCart]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setCartCount(0);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100"
          : "bg-white shadow-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-700 transition shadow-md">
              <span className="text-white font-extrabold text-lg">E</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-gray-800 text-lg leading-tight tracking-tight group-hover:text-green-700 transition">
                Ezegetive
              </h1>
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-widest leading-none">
                Retail &amp; Distribution
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50 font-semibold text-sm transition"
            >
              Products
            </Link>
            <Link
              href="/cart"
              className="px-4 py-2 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50 font-semibold text-sm transition relative"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50 font-semibold text-sm transition"
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl">
                  <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-green-800 text-sm font-semibold">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-600 hover:text-green-700 font-semibold text-sm transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition shadow-md shadow-green-200"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3 animate-slide-in">
            <div className="space-y-1">
              <Link href="/" className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-semibold" onClick={() => setMenuOpen(false)}>
                🏪 Products
              </Link>
              <Link href="/cart" className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-semibold" onClick={() => setMenuOpen(false)}>
                🛒 Cart {cartCount > 0 && <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">{cartCount}</span>}
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin" className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-semibold" onClick={() => setMenuOpen(false)}>
                  ⚙️ Admin Panel
                </Link>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-gray-700 font-semibold">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-4">
                  <Link href="/login" className="block py-3 text-center border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-green-300" onClick={() => setMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/signup" className="block py-3 text-center bg-green-600 text-white rounded-xl font-bold hover:bg-green-700" onClick={() => setMenuOpen(false)}>
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
