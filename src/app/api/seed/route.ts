import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, products } from "@/db/schema";
import { eq } from "drizzle-orm";

const sampleProducts = [
  {
    name: "Organic Basmati Rice (5kg)",
    description: "Premium quality long-grain basmati rice, organically grown. Perfect for biryanis, pilafs, and everyday cooking. Aromatic and fluffy every time.",
    price: "12.99",
    image: "https://images.pexels.com/photos/19858831/pexels-photo-19858831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Groceries",
    stock: 100,
  },
  {
    name: "Farm Fresh Whole Milk (1L)",
    description: "Pasteurized and homogenized whole milk from grass-fed cows. Rich in calcium and vitamins. Farm fresh taste in every glass.",
    price: "3.49",
    image: "https://images.pexels.com/photos/36183642/pexels-photo-36183642.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Dairy",
    stock: 50,
  },
  {
    name: "Artisan Whole Wheat Bread",
    description: "Handcrafted whole wheat bread baked fresh daily. Soft, fluffy texture with a golden crust. No preservatives or artificial ingredients.",
    price: "4.99",
    image: "https://images.pexels.com/photos/18647862/pexels-photo-18647862.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Bakery",
    stock: 75,
  },
  {
    name: "Extra Virgin Olive Oil (500ml)",
    description: "Cold-pressed extra virgin olive oil from hand-picked Mediterranean olives. Perfect for salads, cooking, and dipping. Rich, fruity flavor profile.",
    price: "8.99",
    image: "https://images.pexels.com/photos/9070120/pexels-photo-9070120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Groceries",
    stock: 40,
  },
  {
    name: "Premium Chicken Breast (1kg)",
    description: "Boneless, skinless chicken breast from antibiotic-free, free-range farms. High in protein, low in fat. Individually vacuum sealed for freshness.",
    price: "9.99",
    image: "https://images.pexels.com/photos/9219086/pexels-photo-9219086.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Meat & Poultry",
    stock: 30,
  },
  {
    name: "Natural Lemonade Juice (1L)",
    description: "100% natural lemonade made with real lemons and a hint of mint. No added sugar, no concentrates. Refreshingly delicious and healthy.",
    price: "4.99",
    image: "https://images.pexels.com/photos/3651045/pexels-photo-3651045.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Beverages",
    stock: 60,
  },
  {
    name: "Free-Range Organic Eggs (12pk)",
    description: "Farm-fresh free-range eggs from organically-fed hens. Rich golden yolks with superior taste. Perfect for baking and everyday meals.",
    price: "5.49",
    image: "https://images.pexels.com/photos/4394258/pexels-photo-4394258.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Dairy",
    stock: 45,
  },
  {
    name: "Premium Roasted Coffee (500g)",
    description: "100% Arabica coffee beans, medium roast. Rich, smooth flavor with notes of chocolate and caramel. Ethically sourced from premium farms.",
    price: "14.99",
    image: "https://images.pexels.com/photos/31945549/pexels-photo-31945549.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Beverages",
    stock: 35,
  },
  {
    name: "Fresh Broccoli Bundle",
    description: "Crisp, vibrant green broccoli freshly harvested from local farms. Packed with nutrients and antioxidants. Perfect steamed, roasted, or in stir-fries.",
    price: "3.99",
    image: "https://images.pexels.com/photos/13133609/pexels-photo-13133609.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Fresh Produce",
    stock: 55,
  },
  {
    name: "Chocolate Chip Cookies (250g)",
    description: "Crunchy homemade-style cookies loaded with premium chocolate chips. Made with real butter and natural vanilla. Perfect with coffee or milk.",
    price: "3.99",
    image: "https://images.pexels.com/photos/31323236/pexels-photo-31323236.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Snacks",
    stock: 80,
  },
  {
    name: "Raw Natural Honey (500g)",
    description: "Pure unfiltered raw honey harvested from wildflower meadows. Rich in antioxidants and enzymes. Perfect natural sweetener for teas and cooking.",
    price: "11.99",
    image: "https://images.pexels.com/photos/27433887/pexels-photo-27433887.png?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Groceries",
    stock: 30,
  },
  {
    name: "Atlantic Salmon Fillet (500g)",
    description: "Premium Atlantic salmon fillet, rich in omega-3 fatty acids. Sustainably sourced, individually portioned. Ideal for grilling, baking, or pan-searing.",
    price: "15.99",
    image: "https://images.pexels.com/photos/7627414/pexels-photo-7627414.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
    category: "Seafood",
    stock: 20,
  },
];

export async function POST() {
  try {
    const existing = await db.select().from(users).where(eq(users.email, "admin@ezegetive.com")).limit(1);
    if (existing.length === 0) {
      const hashed = await bcrypt.hash("admin123", 10);
      await db.insert(users).values({ name: "Admin", email: "admin@ezegetive.com", password: hashed, role: "admin" });
    }

    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length === 0) {
      for (const p of sampleProducts) {
        await db.insert(products).values(p);
      }
    }

    return NextResponse.json({ ok: true, message: "Seeded! Admin: admin@ezegetive.com / admin123" });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
