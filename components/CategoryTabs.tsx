"use client";

interface Category {
  id: number;
  name: string;
  created_at: string;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
          activeCategory === null
            ? "bg-primary dark:bg-green-500 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        All Products
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
            activeCategory === category.id
              ? "bg-primary dark:bg-green-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

