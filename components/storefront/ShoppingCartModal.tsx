"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter, Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";

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
  const router = useRouter();
  const locale = useLocale();

  // Hydration handling
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const onCheckout = () => {
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
            <div className="pointer-events-none fixed inset-y-0 right-0 rtl:left-0 rtl:right-auto flex max-w-full sm:pl-10 rtl:sm:pl-0 rtl:sm:pr-10">
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
                                <div className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-md border border-border">
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
                                          {locale === "ar"
                                            ? item.name_ar || item.name
                                            : item.name_en || item.name}
                                        </Link>
                                      </h3>
                                      <div className="ml-4 rtl:mr-4 rtl:ml-0 flex flex-col items-end">
                                        <p>
                                          {formatPrice(
                                            item.price * item.quantity,
                                            locale,
                                          )}
                                        </p>
                                        {item.originalPrice && (
                                          <p className="text-xs text-muted-foreground line-through">
                                            {formatPrice(
                                              item.originalPrice *
                                                item.quantity,
                                              locale,
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {locale === "ar"
                                        ? item.category_ar || item.category
                                        : item.category_en ||
                                          item.category}{" "}
                                      - {item.size}
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
                                        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-muted rounded transition-colors text-foreground"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <span className="w-6 text-center text-foreground font-medium">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.id,
                                            item.quantity + 1,
                                          )
                                        }
                                        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-muted rounded transition-colors text-foreground"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>

                                    <div className="flex">
                                      <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="font-medium text-destructive hover:text-destructive/80 flex items-center gap-1.5 min-h-[44px] px-2 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span>{t("remove")}</span>
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
                          <p>{formatPrice(getTotal(), locale)}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {t("shippingNote")}
                        </p>
                        <div className="mt-6">
                          <Button
                            onClick={onCheckout}
                           className="w-full rounded-full h-14 text-base font-bold shadow-lg touch-manipulation"
                          >
                            {t("checkout")}
                          </Button>
                        </div>
                        <div className="mt-4 flex flex-col items-center justify-center gap-0.5 text-green-700 bg-green-50/50 py-3 px-4 rounded-lg border border-green-200/50 mb-2">
                          <span className="text-xs font-bold flex items-center gap-1.5">🔒 {t("secureCheckout")}</span>
                          <span className="text-[10px] text-green-600/80">{t("paymentDataNote")}</span>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-muted-foreground">
                          <p>
                            {t("or")}{" "}
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
