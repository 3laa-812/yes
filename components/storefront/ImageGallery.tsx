"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [bigImage, setBigImage] = useState(images[0]);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="order-last flex gap-4 lg:order-none lg:flex-col lg:col-span-1">
        {images.map((image, idx) => (
          <div key={idx} className="overflow-hidden rounded-lg bg-gray-100">
            <button
              onClick={() => setBigImage(image)}
              className={cn(
                "relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100",
                bigImage === image
                  ? "ring-2 ring-indigo-500"
                  : "ring-1 ring-transparent hover:ring-indigo-500/50",
              )}
            >
              <Image
                src={image}
                alt="Product Image"
                width={200}
                height={200}
                className="h-full w-full object-cover object-center"
              />
            </button>
          </div>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-lg bg-gray-100 lg:col-span-4">
        <Image
          src={bigImage}
          alt="Big Product Image"
          width={800}
          height={800}
          className="h-full w-full object-cover object-center"
        />
      </div>
    </div>
  );
}
