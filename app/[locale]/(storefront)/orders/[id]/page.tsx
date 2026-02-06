import { notFound } from "next/navigation";
import db from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";

interface Props {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string) {
  return await db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      shippingAddress: true,
      payments: true,
    },
  });
}

const steps = [
  { id: "PENDING", label: "Order Placed", icon: Clock },
  { id: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { id: "SHIPPED", label: "Shipped", icon: Truck },
  { id: "DELIVERED", label: "Delivered", icon: Package },
];

export default async function OrderDetailsPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Order Info */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Order #{order.id.slice(-6)}</h1>
            <Badge
              className="text-lg px-4 py-1"
              variant={isCancelled ? "destructive" : "default"}
            >
              {order.status}
            </Badge>
          </div>

          {!isCancelled && (
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2" />
              <div className="flex justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const statusOrder = [
                    "PENDING",
                    "CONFIRMED",
                    "SHIPPED",
                    "DELIVERED",
                  ];
                  const statusIndex = statusOrder.indexOf(order.status);
                  const isActive = index <= statusIndex;

                  return (
                    <div
                      key={step.id}
                      className="flex flex-col items-center bg-white px-2"
                    >
                      <div
                        className={`p-3 rounded-full border-2 ${isActive ? "border-black bg-black text-white" : "border-gray-300 text-gray-400"}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${isActive ? "text-black" : "text-gray-400"}`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-2 border-b last:border-0 border-gray-100"
                >
                  <div className="relative h-20 w-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {/* Assuming product images is a JSON string of URLs */}
                    <Image
                      src={JSON.parse(item.product.images)[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.selectedSize} / {item.selectedColor}
                    </p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm">Qty: {item.quantity}</span>
                      <span className="font-medium">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between pt-4 font-bold text-lg">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details */}
        <div className="w-full md:w-80 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.country}
                  </p>
                  <p className="mt-2">{order.shippingAddress.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No address details available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge
                    variant={
                      order.paymentStatus === "PAID" ? "default" : "secondary"
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
