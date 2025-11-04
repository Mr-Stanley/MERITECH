
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { Search } from "lucide-react";

interface Category {
  id: number;
  name: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: number;
  status: string;
  category_name?: string;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const url = activeCategory
        ? `/api/products?categoryId=${activeCategory}&status=active`
        : "/api/products?status=active";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products
    .filter((p) =>
      p.name.toLowerCase().includes(search.trim().toLowerCase())
    )
    .filter((p) => (activeCategory ? p.category_id === activeCategory : true));

  const productsByCategory = categories.map((category: Category) => ({
    category,
    products: products.filter((p: Product) => p.category_id === category.id),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF6E5] to-[#FFF0D8] dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
           <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-4">
             Explore Our Product Menu 📦
           </h1>
           <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
             Browse through our range of exciting products, organized neatly by
             category. Tap a category to dive in!
           </p>
        </motion.div>

        {/* Search & Filter Section */}
        <div className="flex items-center justify-center mb-8 gap-3 flex-wrap">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={18} />
             <input
               type="text"
               placeholder="Search products..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm dark:shadow-gray-900/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary dark:focus:ring-green-400 focus:border-primary dark:focus:border-green-400 transition-colors duration-300"
             />
          </div>
        </div>

        {loading ? (
          // Loading shimmer
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-xl"
              ></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 dark:text-red-400">{error}</div>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No Categories Yet"
            description="It looks a little empty here — check back soon!"
            illustration={<div className="text-6xl mb-4 opacity-50">📁</div>}
          />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </motion.div>

            {filteredProducts.length === 0 ? (
              <EmptyState
                title="No Products Found"
                description="Try a different category or search term."
                illustration={<div className="text-6xl mb-4 opacity-50">🛒</div>}
              />
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8"
              >
                {filteredProducts.map((product: Product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    className="transition-transform duration-300"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
