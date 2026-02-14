"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter, Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { event as pixelEvent } from "@/lib/facebookPixel";

interface ShoppingCartModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ShoppingCartModal({
  isOpen,
  setIsOpen,
}: ShoppingCartModalProps) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const t = useTranslations("Cart");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  // Hydration handling
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const onCheckout = () => {
    pixelEvent("InitiateCheckout", {
      content_ids: items.map((item) => item.productId),
      content_category: "checkout",
      num_items: items.reduce((acc, item) => acc + item.quantity, 0),
      value: getTotal(),
      currency: "EGP",
      contents: items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
      })),
    });
    setIsOpen(false);
    router.push("/checkout");
  };

  if (!mounted) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 rtl:left-0 rtl:right-auto flex max-w-full pl-10 rtl:pl-0 rtl:pr-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full rtl:-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full rtl:-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-card shadow-xl border-l border-border">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-bold text-foreground">
                          {t("title")}
                        </Dialog.Title>
                        <div className="ml-3 rtl:mr-3 rtl:ml-0 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">{t("closePanel")}</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul
                            role="list"
                            className="-my-6 divide-y divide-border"
                          >
                            {items.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-20">
                                <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
                                <p className="mt-4 text-center text-muted-foreground">
                                  {t("empty")}
                                </p>
                              </div>
                            )}

                            {items.map((item) => (
                              <li key={item.id} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={100}
                                    height={100}
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>

                                <div className="ml-4 rtl:mr-4 rtl:ml-0 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-foreground">
                                      <h3>
                                        <Link
                                          href={`/products/${item.productId}`}
                                          className="hover:text-primary transition-colors"
                                        >
                                          {item.name}
                                        </Link>
                                      </h3>
                                      <div className="ml-4 rtl:mr-4 rtl:ml-0 flex flex-col items-end">
                                        <p>
                                          {formatPrice(
                                            item.price * item.quantity,
                                          )}
                                        </p>
                                        {item.originalPrice && (
                                          <p className="text-xs text-muted-foreground line-through">
                                            {formatPrice(
                                              item.originalPrice *
                                                item.quantity,
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {item.category} - {item.size}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div
                                        className="h-4 w-4 rounded-full border border-border"
                                        style={{ backgroundColor: item.color }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center gap-2 border border-border rounded-md p-1">
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.id,
                                            Math.max(1, item.quantity - 1),
                                          )
                                        }
                                        className="p-1 hover:bg-muted rounded transition-colors text-foreground"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="w-4 text-center text-foreground font-medium">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.id,
                                            item.quantity + 1,
                                          )
                                        }
                                        className="p-1 hover:bg-muted rounded transition-colors text-foreground"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>

                                    <div className="flex">
                                      <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="font-medium text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        {t("remove")}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div className="border-t border-border px-4 py-6 sm:px-6 bg-card">
                        <div className="flex justify-between text-base font-medium text-foreground">
                          <p>{t("subtotal")}</p>
                          <p>{formatPrice(getTotal())}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {t("shippingNote")}
                        </p>
                        <div className="mt-6">
                          <Button
                            onClick={onCheckout}
                            className="w-full rounded-full py-6 text-base font-bold shadow-lg"
                          >
                            {t("checkout")}
                          </Button>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-muted-foreground">
                          <p>
                            {tCommon("or")}{" "}
                            <button
                              type="button"
                              className="font-medium text-primary hover:text-primary/80 transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              {t("continueShopping")}
                              <span
                                aria-hidden="true"
                                className="rtl:rotate-180 inline-block"
                              >
                                {" "}
                                &rarr;
                              </span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
