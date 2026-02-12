import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import db from "@/lib/db";
import { PixelPurchase } from "@/components/storefront/PixelPurchase";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = params.orderId as string;

  let order = null;
  if (orderId) {
    order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {order && (
        <PixelPurchase
          order={{
            id: order.id,
            value: Number(order.total),
            currency: "EGP", // Assuming EGP as per req
            contents: order.items.map((item) => ({
              id: item.productId,
              quantity: item.quantity,
            })),
          }}
        />
      )}
      <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Order Confirmed!
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        Thank you for your purchase. We've received your order
        {orderId ? ` #${orderId.slice(-6)}` : ""} and will begin processing it
        right away.
      </p>
      <div className="mt-8 flex gap-4">
        {orderId && (
          <Button asChild>
            <Link href={`/orders/${orderId}`}>View Order</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
