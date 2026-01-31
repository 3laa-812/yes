"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ShoppingCartModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ShoppingCartModal({
  isOpen,
  setIsOpen,
}: ShoppingCartModalProps) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  // Hydration handling
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const onCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items, email: "test@example.com" }), // Hardcoded email for demo
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
    }
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Shopping cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul
                            role="list"
                            className="-my-6 divide-y divide-gray-200"
                          >
                            {items.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-20">
                                <ShoppingBag className="h-16 w-16 text-gray-300" />
                                <p className="mt-4 text-center text-gray-500">
                                  Your cart is empty.
                                </p>
                              </div>
                            )}

                            {items.map((item) => (
                              <li key={item.id} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={100}
                                    height={100}
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>
                                        <a href={`/products/${item.productId}`}>
                                          {item.name}
                                        </a>
                                      </h3>
                                      <p className="ml-4">
                                        {formatPrice(
                                          item.price * item.quantity,
                                        )}
                                      </p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                      {item.category} - {item.size}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div
                                        className="h-4 w-4 rounded-full border"
                                        style={{ backgroundColor: item.color }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center gap-2 border rounded-md p-1">
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.id,
                                            Math.max(1, item.quantity - 1),
                                          )
                                        }
                                        className="p-1 hover:bg-gray-100 rounded"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="w-4 text-center">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.id,
                                            item.quantity + 1,
                                          )
                                        }
                                        className="p-1 hover:bg-gray-100 rounded"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>

                                    <div className="flex">
                                      <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Remove
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
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Subtotal</p>
                          <p>{formatPrice(getTotal())}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-6">
                          <Button
                            onClick={onCheckout}
                            className="w-full rounded-full py-6 text-base"
                          >
                            Checkout
                          </Button>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            or{" "}
                            <button
                              type="button"
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                              onClick={() => setIsOpen(false)}
                            >
                              Continue Shopping
                              <span aria-hidden="true"> &rarr;</span>
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
