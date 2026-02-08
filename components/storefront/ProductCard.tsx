import Image from "next/image";
import { Link } from "@/i18n/routing";
import { formatPrice } from "@/lib/utils";
import { ScaleHover } from "@/components/ui/motion";

interface ProductCardProps {
  id: string;
  name: string;
  price: string | number;
  image: string;
  category: string;
  discountPrice?: number | null;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  category,
  discountPrice,
}: ProductCardProps) {
  const isDiscounted =
    discountPrice && discountPrice > 0 && discountPrice < Number(price);
  const currentPrice = isDiscounted ? discountPrice : Number(price);
  const originalPrice = Number(price);

  // Calculate discount percentage
  const discountPercentage = isDiscounted
    ? Math.round(
        ((originalPrice - (discountPrice as number)) / originalPrice) * 100,
      )
    : 0;

  return (
    <Link href={`/products/${id}`} className="group block">
      <ScaleHover className="relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100 relative">
          <Image
            src={image}
            alt={name}
            fill
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {isDiscounted && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
              -{discountPercentage}%
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {category}
          </p>
          <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary/80 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-bold ${isDiscounted ? "text-red-600" : "text-foreground"}`}
            >
              {formatPrice(currentPrice)}
            </p>
            {isDiscounted && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </p>
            )}
          </div>
        </div>
      </ScaleHover>
    </Link>
  );
}
