import Image from "next/image";
import { Link } from "@/i18n/routing";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: string | number;
  image: string;
  category: string;
}

import { ScaleHover } from "@/components/ui/motion";

export function ProductCard({
  id,
  name,
  price,
  image,
  category,
}: ProductCardProps) {
  return (
    <ScaleHover className="group relative">
      <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
        <Image
          src={image}
          alt={name}
          width={400}
          height={400}
          className="h-full w-full object-cover object-center lg:h-full lg:w-full"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <Link href={`/products/${id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">{category}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">
          {formatPrice(Number(price))}
        </p>
      </div>
    </ScaleHover>
  );
}
