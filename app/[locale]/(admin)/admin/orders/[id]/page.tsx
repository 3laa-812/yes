import db from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/app/[locale]/(admin)/actions";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLocale } from "next-intl/server";

interface Props {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string) {
  return await db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      shippingAddress: true,
      user: true,
    },
  });
}

export default async function AdminOrderDetailsPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrder(id);
  const locale = await getLocale();

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="relative h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={JSON.parse(item.product.images)[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        Size: {item.selectedSize} | Color: {item.selectedColor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(Number(item.price), locale)} x{" "}
                        {item.quantity}
                      </p>
                      <p className="font-bold">
                        {formatCurrency(
                          Number(item.price) * item.quantity,
                          locale,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-4 font-bold text-lg border-t mt-4">
                  <span>Total</span>
                  <span>{formatCurrency(Number(order.total), locale)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Info</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{order.shippingAddress.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{order.shippingAddress.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {order.shippingAddress.street},{" "}
                      {order.shippingAddress.city}
                    </p>
                  </div>
                </div>
              ) : (
                <p>No shipping info</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Current Status</span>
                <Badge>{order.status}</Badge>
              </div>

              <form action={updateOrderStatus} className="space-y-4">
                <input type="hidden" name="orderId" value={order.id} />
                <Select name="status" defaultValue={order.status}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full">
                  Update Status
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <Badge
                  variant={
                    order.paymentStatus === "PAID" ? "default" : "destructive"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              {/* Could add manual "Mark as Paid" button for COD here later */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
