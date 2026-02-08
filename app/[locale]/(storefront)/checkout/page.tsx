"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { createOrder } from "@/app/actions";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const { items, getTotal, removeItem, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Protect empty cart
  useEffect(() => {
    if (items.length === 0) {
      // Allow viewing if just cleared? No, redirect.
      // But maybe delay to avoid flash if hydration delayed
    }
  }, [items]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = t("validation.firstName");
    if (!formData.lastName) newErrors.lastName = t("validation.lastName");
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = t("validation.email");
    if (!formData.phone || formData.phone.length < 10)
      newErrors.phone = t("validation.phone");
    if (!formData.address) newErrors.address = t("validation.address");
    if (!formData.city) newErrors.city = t("validation.city");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      toast.error(t("empty"));
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        ...formData,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      };

      const result = await createOrder(orderData);

      if (result.success) {
        toast.success(t("messages.success"));
        clearCart();
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        }
      } else {
        toast.error(result.error || t("messages.failed"));
      }
    } catch (error) {
      console.error("Order error", error);
      toast.error(t("messages.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-4">{t("empty")}</h1>
        <p className="text-gray-500 mb-8">{t("addItems")}</p>
        <Button onClick={() => router.push("/")}>
          {t("continueShopping", { default: "Continue Shopping" })}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
        {t("title")}
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("shippingDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                id="checkout-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("firstName")}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="text-start"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("lastName")}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="text-start"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="text-start"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="01xxxxxxxxx"
                    className="text-start"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("address")}</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Street Name, Apt 4"
                    className="text-start"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">{t("city")}</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Cairo"
                    className="text-start"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("paymentMethod")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setPaymentMethod("COD")}
                  className={cn(
                    "cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center justify-center transition-all",
                    paymentMethod === "COD"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <span className="font-bold text-lg text-center">
                    {t("cod")}
                  </span>
                  <span className="text-sm text-gray-500 text-center">
                    {t("codDesc")}
                  </span>
                </div>

                <div
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={cn(
                    "cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center justify-center transition-all",
                    paymentMethod === "ONLINE"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <span className="font-bold text-lg text-center">
                    {t("online")}
                  </span>
                  <span className="text-sm text-gray-500 text-center">
                    {t("onlineDesc")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>{t("orderSummary")}</CardTitle>
              <CardDescription>
                {t("itemsInCart", { count: items.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-2 border-b last:border-0"
                  >
                    <div className="relative h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.size} / {item.color}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>{t("shipping", { default: "Shipping" })}</span>
                  <span>{t("free")}</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2">
                  <span>{t("total")}</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                className="w-full text-lg py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  `${t("completeOrder")} - $${getTotal().toFixed(2)}`
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
