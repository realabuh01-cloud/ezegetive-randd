import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Ezegetive Retail and Distribution",
  description:
    "Your trusted partner in retail and distribution — quality products, unbeatable prices.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-green-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <span className="text-green-700 font-extrabold text-lg">E</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight">Ezegetive</h3>
                    <p className="text-green-300 text-xs font-medium">Retail &amp; Distribution</p>
                  </div>
                </div>
                <p className="text-green-200 text-sm leading-relaxed">
                  Your trusted partner for quality products at unbeatable prices.
                  We deliver excellence in every package.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-green-300">
                  Quick Links
                </h4>
                <ul className="space-y-2 text-sm text-green-200">
                  <li><a href="/" className="hover:text-white transition">Shop Products</a></li>
                  <li><a href="/cart" className="hover:text-white transition">My Cart</a></li>
                  <li><a href="/login" className="hover:text-white transition">Sign In</a></li>
                  <li><a href="/signup" className="hover:text-white transition">Create Account</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-green-300">
                  Contact
                </h4>
                <ul className="space-y-2 text-sm text-green-200">
                  <li>📧 info@ezegetive.com</li>
                  <li>📞 +2347015598263</li>
                  <li>📍 NO. 7 DEEPERLIFE ROAD ,OMACHI</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-green-700 pt-6 text-center">
              <p className="text-green-400 text-xs">
                &copy; {new Date().getFullYear()} Ezegetive Retail and Distribution. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
