"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { isPresignedUrl } from "@/lib/imageUtils";

interface ProductCarouselProps {
  images: string[];
  alt: string;
  heightClass?: string; // e.g. h-48
}

export default function ProductCarousel({ images, alt, heightClass = "h-48" }: ProductCarouselProps) {
  const safeImages = (images || []).filter(Boolean);
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => {
    setIndex((prev) => (prev + 1) % (safeImages.length || 1));
  }, [safeImages.length]);

  useEffect(() => {
    if (!safeImages.length) return;
    const id = setInterval(advance, 5000); // 5 seconds
    return () => clearInterval(id);
  }, [advance, safeImages.length]);

  const current = safeImages[index] || "";

  return (
    <div className={`relative w-full ${heightClass} bg-gray-100 dark:bg-gray-600 overflow-hidden rounded`}> 
      {current ? (
        <Image
          src={current}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={isPresignedUrl(current)}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-4xl">📦</div>
      )}

      {safeImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {safeImages.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-white/90" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}


