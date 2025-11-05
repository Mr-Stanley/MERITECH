import Image from "next/image";
import ProductCarousel from "./ProductCarousel";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_urls?: string[]; // derived on client: split by comma
  category_id: number;
  status: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const combinedImages: string[] = (() => {
    if (product.image_urls && product.image_urls.length) return product.image_urls;
    if (typeof product.image_url === "string" && product.image_url.includes(",")) {
      return product.image_url.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return product.image_url ? [product.image_url] : [];
  })();
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900 transition-all duration-300">
      {combinedImages.length > 1 ? (
        <ProductCarousel images={combinedImages} alt={product.name} heightClass="h-48" />
      ) : (
        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-600">
          {combinedImages[0] ? (
            <Image
              src={combinedImages[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-4xl">📦</div>
          )}
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary dark:text-green-400">
            ₦{parseFloat(product.price.toString()).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

