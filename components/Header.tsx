"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialize from localStorage, default to light mode if not set
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      const enabled = stored === "dark"; // Only enable dark if explicitly set
      setIsDark(enabled);
      if (enabled) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-20 w-20 md:h-28 md:w-28">
              <Image
                src="/images/potential 2.jpg"
                alt="MERITECH BUILDING TECHNOLOGIES"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl md:text-2xl font-bold text-primary dark:text-green-400">
              MERITECH BUILDING TECHNOLOGY
            </span>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link
              href="/menu"
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400 transition-colors font-medium"
            >
              View Menu
            </Link>
            <Link
              href="/admin"
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400 transition-colors font-medium"
            >
              Admin
            </Link>
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="ml-2 inline-flex items-center justify-center h-10 w-10 rounded-full border border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-green-400 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400 transition-colors bg-white dark:bg-gray-700"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
