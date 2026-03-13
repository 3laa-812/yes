"use client";

import { memo, useState } from "react";
import { useCartStore, CartItem } from "@/lib/store";
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
import {
  Loader2,
  Trash2,
  Banknote,
  Smartphone,
  Zap,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { UploadDropzone } from "@/lib/uploadthing";

interface CheckoutSummaryProps {
  items: CartItem[];
  total: number;
  t: ReturnType<typeof useTranslations<"Checkout">>;
  locale: string;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const CheckoutSummary = memo(function CheckoutSummary({
  items,
  total,
  t,
  locale,
  isSubmitting,
  onSubmit,
}: CheckoutSummaryProps) {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>{t("orderSummary")}</CardTitle>
        <CardDescription>
          {t("itemsInCart", { count: items.length })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {items.map((item: CartItem) => (
            <div
              key={item.id}
              className="flex gap-4 py-2 border-b border-border last:border-0"
            >
              <div className="relative h-16 w-16 bg-muted rounded overflow-hidden shrink-0 border border-border">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium line-clamp-1 text-foreground">
                  {item.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.size} / {item.color}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">
                    {t("qty")}: {item.quantity}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(item.price * item.quantity, locale)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 border-t border-border pt-4">
          <div className="flex justify-between text-muted-foreground">
            <span>{t("shipping")}</span>
            <span>{t("free")}</span>
          </div>
          <div className="flex justify-between font-bold text-xl pt-2 border-t border-border mt-2 text-foreground">
            <span>{t("total")}</span>
            <span>{formatCurrency(total, locale)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSubmit}
          className="w-full text-lg py-6 font-bold shadow-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t("processing")}
            </>
          ) : (
            `${t("completeOrder")} - ${formatCurrency(total, locale)}`
          )}
        </Button>
        <div className="w-full mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-green-700 bg-green-50/50 py-3 rounded-lg border border-green-200/50">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-medium px-1">{t("securePayment")}</span>
        </div>
      </CardFooter>
    </Card>
  );
});

export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { items, getTotal, removeItem, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<
    "COD" | "ONLINE" | "VODAFONE_CASH" | "INSTAPAY"
  >("COD");
  const [referenceId, setReferenceId] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().split(" ").length < 2) {
      newErrors.fullName = t("validation.fullName");
    }
    
    const emailToValidate = formData.email.trim();
    if (emailToValidate && !/^\S+@\S+\.\S+$/.test(emailToValidate)) {
      newErrors.email = t("validation.email");
    }

    if (!formData.phone || formData.phone.length < 10)
      newErrors.phone = t("validation.phone");
    if (!formData.address) newErrors.address = t("validation.address");
    if (!formData.city) newErrors.city = t("validation.city");

    if (
      ["VODAFONE_CASH", "INSTAPAY", "BANK_TRANSFER"].includes(paymentMethod)
    ) {
      if (!proofUrl && !referenceId) {
        newErrors.proof = t("validation.proofRequired");
        toast.error(t("validation.proofRequired"));
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneBlur = async () => {
    if (formData.phone && formData.phone.length >= 10) {
      setIsLoadingDetails(true);
      try {
        // Import this action at the top of the file dynamically or normally
        const { checkoutGetUserDetailsByPhone } = await import("@/app/actions");
        const res = await checkoutGetUserDetailsByPhone(formData.phone);

        if (res.success && res.data) {
          const fetchedFullName = 
            [res.data.firstName, res.data.lastName].filter(Boolean).join(" ");

          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || fetchedFullName || "",
            email: prev.email || res.data.email || "",
            address: prev.address || res.data.address || "",
            city: prev.city || res.data.city || "",
          }));
          toast.success("Saved details found and applied", {
            icon: <UserCheck className="w-4 h-4" />,
          });
        }
      } catch (error) {
        console.error("Error fetching user details", error);
      } finally {
        setIsLoadingDetails(false);
      }
    }
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
      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const orderData = {
        ...formData,
        firstName,
        lastName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        paymentMethod,
        referenceId,
        proofUrl,
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
          {t("continueShopping")}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left text-foreground">
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
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("fullName")}</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder={t("placeholders.fullName")}
                      className="text-start h-12 text-base md:text-lg"
                      autoComplete="name"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("email")}{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t("placeholders.email")}
                    className="text-start h-12 text-base md:text-lg"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t("phone")}
                    {isLoadingDetails && (
                      <Loader2 className="w-3 h-3 animate-spin inline ml-2 text-muted-foreground" />
                    )}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handlePhoneBlur}
                    placeholder={t("placeholders.phone")}
                    className="text-start h-12 text-base md:text-lg"
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("address")}</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={t("placeholders.address")}
                    className="text-start h-12 text-base md:text-lg"
                    autoComplete="street-address"
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">{t("city")}</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={t("placeholders.city")}
                    className="text-start h-12 text-base md:text-lg"
                    autoComplete="address-level2"
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setPaymentMethod("COD")}
                  className={cn(
                    "relative cursor-pointer rounded-xl p-5 flex flex-col items-center justify-center transition-all bg-card border-2 shadow-sm hover:shadow-md",
                    paymentMethod === "COD"
                      ? "border-primary bg-primary/5 ring-1 ring-primary ring-offset-0"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {paymentMethod === "COD" && (
                    <div className="absolute top-3 right-3 text-primary animate-in zoom-in-50 duration-200">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "p-3 rounded-full mb-3",
                      paymentMethod === "COD" ? "bg-primary/10" : "bg-muted",
                    )}
                  >
                    <Banknote
                      className={cn(
                        "w-7 h-7",
                        paymentMethod === "COD"
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <span className="font-semibold text-base text-center text-foreground mb-1">
                    {t("cod")}
                  </span>
                  <span className="text-xs text-muted-foreground text-center px-2">
                    {t("codDesc")}
                  </span>
                </div>

                <div
                  onClick={() => setPaymentMethod("VODAFONE_CASH")}
                  className={cn(
                    "relative cursor-pointer rounded-xl p-5 flex flex-col items-center justify-center transition-all bg-card border-2 shadow-sm hover:shadow-md group",
                    paymentMethod === "VODAFONE_CASH"
                      ? "border-[#e60000] bg-[#e60000]/5 ring-1 ring-[#e60000] ring-offset-0"
                      : "border-border hover:border-[#e60000]/40",
                  )}
                >
                  {paymentMethod === "VODAFONE_CASH" && (
                    <div className="absolute top-3 right-3 text-[#e60000] animate-in zoom-in-50 duration-200">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "p-3 rounded-full mb-3 transition-colors",
                      paymentMethod === "VODAFONE_CASH"
                        ? "bg-[#e60000]/10"
                        : "bg-muted group-hover:bg-[#e60000]/5",
                    )}
                  >
                    <Smartphone
                      className={cn(
                        "w-7 h-7 transition-colors",
                        paymentMethod === "VODAFONE_CASH"
                          ? "text-[#e60000]"
                          : "text-muted-foreground group-hover:text-[#e60000]",
                      )}
                    />
                  </div>
                  <span className="font-semibold text-base text-center text-foreground mb-1">
                    {t("vodafoneCash")}
                  </span>
                  <span className="text-xs text-muted-foreground text-center px-2">
                    {t("vodafoneCashDesc")}
                  </span>
                </div>

                <div
                  onClick={() => setPaymentMethod("INSTAPAY")}
                  className={cn(
                    "relative cursor-pointer rounded-xl p-5 flex flex-col items-center justify-center transition-all bg-card border-2 shadow-sm hover:shadow-md group",
                    paymentMethod === "INSTAPAY"
                      ? "border-[#6A0DAD] bg-[#6A0DAD]/5 ring-1 ring-[#6A0DAD] ring-offset-0"
                      : "border-border hover:border-[#6A0DAD]/40",
                  )}
                >
                  {paymentMethod === "INSTAPAY" && (
                    <div className="absolute top-3 right-3 text-[#6A0DAD] animate-in zoom-in-50 duration-200">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "p-3 rounded-full mb-3 transition-colors",
                      paymentMethod === "INSTAPAY"
                        ? "bg-[#6A0DAD]/10"
                        : "bg-muted group-hover:bg-[#6A0DAD]/5",
                    )}
                  >
                    <Zap
                      className={cn(
                        "w-7 h-7 transition-colors",
                        paymentMethod === "INSTAPAY"
                          ? "text-[#6A0DAD]"
                          : "text-muted-foreground group-hover:text-[#6A0DAD]",
                      )}
                    />
                  </div>
                  <span className="font-semibold text-base text-center text-foreground mb-1">
                    {t("instapay")}
                  </span>
                  <span className="text-xs text-muted-foreground text-center px-2">
                    {t("instapayDesc")}
                  </span>
                </div>
              </div>

              {["VODAFONE_CASH", "INSTAPAY"].includes(paymentMethod) && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-4">
                    {paymentMethod === "VODAFONE_CASH" &&
                      t("vodafoneCashInstructions")}
                    {paymentMethod === "INSTAPAY" && t("instapayInstructions")}
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("uploadProof")}</Label>
                      {proofUrl ? (
                        <div className="relative h-32 w-full border rounded-lg overflow-hidden">
                          <Image
                            src={proofUrl}
                            alt="Payment Proof"
                            fill
                            className="object-cover"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => setProofUrl("")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border hover:border-primary/50 transition-colors rounded-lg overflow-hidden">
                          <UploadDropzone
                            endpoint="paymentProofUploader"
                            config={{ mode: "auto" }}
                            onClientUploadComplete={(res) => {
                              if (res && res[0]) {
                                setProofUrl(res[0].url);
                                toast.success(
                                  t("messages.uploadedSuccessfully"),
                                );
                              }
                            }}
                            onUploadError={(error: Error) => {
                              toast.error(`Error: ${error.message}`);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referenceId">{t("referenceId")}</Label>
                      <Input
                        id="referenceId"
                        name="referenceId"
                        value={referenceId}
                        onChange={(e) => setReferenceId(e.target.value)}
                        placeholder="e.g. 1234567890"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-4 font-medium italic">
                    {t("manualPaymentNote")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <CheckoutSummary
            items={items}
            total={getTotal()}
            t={t}
            locale={locale}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
