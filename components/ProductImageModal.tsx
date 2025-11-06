"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { isPresignedUrl } from "@/lib/imageUtils";

interface ProductImageModalProps {
  product: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    image_urls?: string[];
  };
  images: string[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductImageModal({
  product,
  images,
  isOpen,
  onClose,
}: ProductImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeImages = images.filter(Boolean);
  const hasMultipleImages = safeImages.length > 1;

  // Reset to first image when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  }, [safeImages.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrevious, onClose]);

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  if (!isOpen || safeImages.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 text-white transition-all shadow-lg"
        aria-label="Close modal"
      >
        <X size={24} />
      </button>

      {/* Previous Button - Large and Prominent */}
      {hasMultipleImages && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-4 md:left-8 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-4 md:p-5 text-white transition-all shadow-lg hover:scale-110"
          aria-label="Previous image"
        >
          <ChevronLeft size={32} className="md:w-10 md:h-10" />
        </button>
      )}

      {/* Full Screen Image */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-w-[95vw] max-h-[95vh]">
          <Image
            src={safeImages[currentIndex]}
            alt={`${product.name} - Image ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="95vw"
            priority
            unoptimized={isPresignedUrl(safeImages[currentIndex])}
          />
        </div>
      </div>

      {/* Next Button - Large and Prominent */}
      {hasMultipleImages && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 md:right-8 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-4 md:p-5 text-white transition-all shadow-lg hover:scale-110"
          aria-label="Next image"
        >
          <ChevronRight size={32} className="md:w-10 md:h-10" />
        </button>
      )}

      {/* Image Counter - Top Center */}
      {hasMultipleImages && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm md:text-base font-medium">
          {currentIndex + 1} / {safeImages.length}
        </div>
      )}

      {/* Product Info - Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6 md:p-8 z-20">
        <div className="max-w-4xl mx-auto text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {product.name}
          </h2>
          {product.description && (
            <p className="text-gray-200 mb-3 text-sm md:text-base line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center">
            <span className="text-2xl md:text-3xl font-bold text-primary dark:text-green-400">
              ₦{parseFloat(product.price.toString()).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation - Bottom Right */}
      {hasMultipleImages && safeImages.length > 1 && (
        <div className="absolute bottom-20 md:bottom-24 right-4 z-20 bg-black/50 backdrop-blur-sm p-3 rounded-lg overflow-x-auto max-w-[200px] md:max-w-[300px]">
          <div className="flex gap-2">
            {safeImages.map((img, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-primary dark:border-green-400 scale-110"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`Go to image ${index + 1}`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={isPresignedUrl(img)}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

