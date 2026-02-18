"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [bigImage, setBigImage] = useState(images[0]);
  const t = useTranslations("Product");

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="order-last flex gap-4 lg:order-none lg:flex-col lg:col-span-1">
        {images.map((image, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-lg bg-muted border border-border"
          >
            <button
              onClick={() => setBigImage(image)}
              className={cn(
                "relative aspect-square w-full overflow-hidden rounded-lg bg-muted",
                bigImage === image
                  ? "ring-2 ring-primary"
                  : "ring-1 ring-transparent hover:ring-primary/50 transition-all",
              )}
            >
              <Image
                src={image}
                alt={t("productImage")}
                width={200}
                height={200}
                sizes="80px"
                className="h-full w-full object-cover object-center"
              />
            </button>
          </div>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-lg bg-muted border border-border lg:col-span-4 max-h-[600px]">
        <Image
          src={bigImage}
          alt={t("bigProductImage")}
          width={800}
          height={800}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="h-full w-full object-cover object-center"
          priority
        />
      </div>
    </div>
  );
}
