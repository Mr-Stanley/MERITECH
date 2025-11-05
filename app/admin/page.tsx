"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
    status: "active",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // QR Code
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      // Ensure data is always an array
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]); // Set to empty array on error
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      // Ensure data is always an array
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); // Set to empty array on error
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const generateQRCode = useCallback(async () => {
    try {
      const menuUrl = `${window.location.origin}/menu`;
      const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchProducts();
      generateQRCode();
    }
  }, [isAuthenticated, fetchCategories, fetchProducts, generateQRCode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch (error) {
      setLoginError("An error occurred. Please try again.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
    setShowLogin(true);
    router.push("/admin");
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCategory
        ? "/api/categories"
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingCategory
            ? { id: editingCategory.id, name: categoryName }
            : { name: categoryName }
        ),
      });

      if (response.ok) {
        await fetchCategories();
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryName("");
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCategories();
        await fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      setUploadError("");
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      const uploaded: string[] = [];
      for (const file of files) {
        if (!allowed.includes(file.type)) {
          setUploadError("Invalid file type. Only images are allowed.");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setUploadError("File too large. Maximum size is 5MB.");
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await response.json();
        if (response.ok && data?.url) {
          uploaded.push(data.url);
        }
      }
      const existing = productForm.image_url ? productForm.image_url.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const merged = [...existing, ...uploaded];
      setProductForm({ ...productForm, image_url: merged.join(",") });
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Unexpected error during upload.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingProduct
            ? { ...productForm, id: editingProduct.id }
            : productForm
        ),
      });

      if (response.ok) {
        await fetchProducts();
        setShowProductModal(false);
        setEditingProduct(null);
        setProductForm({
          name: "",
          description: "",
          price: "",
          image_url: "",
          category_id: "",
          status: "active",
        });
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowCategoryModal(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image_url: product.image_url || "",
      category_id: product.category_id.toString(),
      status: product.status,
    });
    setShowProductModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8 w-full max-w-md transition-colors duration-300">
          <h1 className="text-3xl font-bold text-center mb-8 text-primary">
            MERITECH Admin Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded">
                  {loginError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-green-400 focus:border-transparent transition-colors duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-green-400 focus:border-transparent transition-colors duration-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Login
              </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* QR Code Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-8 transition-colors duration-300">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Menu QR Code
          </h2>
          {qrCodeUrl && (
            <div className="flex flex-col items-center">
              {/* QR Code is a data URL, so use regular img tag */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                width={300}
                height={300}
                className="mb-4"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan this QR code to access the menu
              </p>
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-8 transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Categories
            </h2>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryName("");
                setShowCategoryModal(true);
              }}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Category
            </button>
          </div>

          {categoriesLoading ? (
            <div className="text-center py-8 text-gray-700 dark:text-gray-300">Loading...</div>
          ) : !Array.isArray(categories) || categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No categories yet. Add one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-3 text-gray-800 dark:text-gray-200">Name</th>
                    <th className="text-left p-3 text-gray-800 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b dark:border-gray-700">
                      <td className="p-3 text-gray-700 dark:text-gray-300">{category.name}</td>
                      <td className="p-3">
                        <button
                          onClick={() => openEditCategory(category)}
                          className="text-primary dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Products</h2>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: "",
                  description: "",
                  price: "",
                  image_url: "",
                  category_id: "",
                  status: "active",
                });
                setShowProductModal(true);
              }}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Product
            </button>
          </div>

          {productsLoading ? (
            <div className="text-center py-8 text-gray-700 dark:text-gray-300">Loading...</div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No products yet. Add one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-3 text-gray-800 dark:text-gray-200">Image</th>
                    <th className="text-left p-3 text-gray-800 dark:text-gray-200">Name</th>
                    <th className="text-left p-3 text-gray-800 dark:text-gray-200">Price</th>
                    <th className="text-left p-3 text-gray-800 dark:text-gray-200">Category</th>
                    <th className="text-left p-3 text-gray-800 dark:text-gray-200">Status</th>
                    <th className="text-left p-3 text-gray-800 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b dark:border-gray-700">
                      <td className="p-3">
                        {product.image_url ? (
                          <div className="relative w-16 h-16">
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            📦
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{product.name}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        ₦{parseFloat(product.price.toString()).toFixed(2)}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {
                          categories.find(
                            (c) => c.id === product.category_id
                          )?.name
                        }
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            product.status === "active"
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => openEditProduct(product)}
                          className="text-primary dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-green-400 focus:border-transparent transition-colors duration-300"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCategory(null);
                      setCategoryName("");
                    }}
                    className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl my-8 transition-colors duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h3>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-green-400 focus:border-transparent transition-colors duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-green-400 focus:border-transparent transition-colors duration-300"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-green-400 focus:border-transparent transition-colors duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-green-400 focus:border-transparent transition-colors duration-300"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={productForm.status}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-green-400 focus:border-transparent transition-colors duration-300"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    multiple
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-green-400 focus:border-transparent transition-colors duration-300"
                    disabled={uploadingImage}
                  />
                  {uploadError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{uploadError}</p>
                  )}
                  {uploadingImage && (
                    <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                  )}
                  {productForm.image_url && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {productForm.image_url
                        .split(",")
                        .map((u) => u.trim())
                        .filter(Boolean)
                        .map((url) => (
                          <div key={url} className="relative w-24 h-24">
                            <Image src={url} alt="Preview" fill className="object-cover rounded" sizes="96px" />
                            <button
                              type="button"
                              onClick={() => {
                                const remaining = productForm.image_url
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                                  .filter((x) => x !== url);
                                setProductForm({ ...productForm, image_url: remaining.join(",") });
                              }}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-5 w-5 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      setEditingProduct(null);
                      setProductForm({
                        name: "",
                        description: "",
                        price: "",
                        image_url: "",
                        category_id: "",
                        status: "active",
                      });
                    }}
                    className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

