"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Maximize2, X } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const t = useTranslations("Storefront.ProductDetails");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPosition = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollPosition / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const scrollTo = (index: number) => {
    setCurrentIndex(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsZoomed(false);
    };
    if (isZoomed) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomed]);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col-reverse lg:grid lg:grid-cols-5 gap-4">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:col-span-1 pb-2 lg:pb-0 scrollbar-hide">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={cn(
              "relative aspect-[4/5] lg:aspect-square w-20 lg:w-full shrink-0 overflow-hidden rounded-lg bg-muted transition-all",
              currentIndex === idx
                ? "ring-2 ring-primary ring-offset-2"
                : "ring-1 ring-border hover:ring-primary/50",
            )}
            aria-label={`Select product image ${idx + 1}`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${idx + 1}`}
              fill
              sizes="80px"
              className="object-cover object-center"
            />
          </button>
        ))}
      </div>

      {/* Main Image Slider */}
      <div className="relative lg:col-span-4 rounded-lg overflow-hidden bg-muted group border border-border">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory w-full h-full no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {images.map((image, idx) => (
            <div
              key={idx}
              className="relative w-full shrink-0 snap-center aspect-[4/5] sm:aspect-square cursor-zoom-in"
              onClick={() => setIsZoomed(true)}
            >
              <Image
                src={image}
                alt={`Main Product Image ${idx + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Zoom Button overlay (explicit click) */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 dark:bg-black/50 backdrop-blur text-foreground flex items-center justify-center rounded-full opacity-0 lg:group-hover:opacity-100 transition-opacity"
          aria-label="Zoom Image"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {/* Pagination Dots (Mobile) */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 lg:hidden z-10">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                currentIndex === idx
                  ? "w-4 bg-primary"
                  : "w-1.5 bg-primary/40 backdrop-blur-sm",
              )}
            />
          ))}
        </div>
      </div>

      {/* Zoom Modal - Full Screen Custom */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="flex justify-end p-4 lg:p-6 absolute top-0 right-0 z-[60]">
            <button
              onClick={() => setIsZoomed(false)}
              className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full"
              aria-label="Close Zoom"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div
            className="flex-1 relative overflow-auto cursor-zoom-out flex items-center justify-center p-4 lg:p-12 w-full h-full"
            onClick={() => setIsZoomed(false)}
          >
            <div
              className="relative w-full h-full max-w-7xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[currentIndex]}
                alt="Zoomed Product Image"
                fill
                className="object-contain"
                quality={100}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
