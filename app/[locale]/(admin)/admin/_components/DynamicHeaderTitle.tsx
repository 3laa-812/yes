"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useTranslations } from "next-intl";

export function DynamicHeaderTitle() {
  const segment = useSelectedLayoutSegment();
  const t = useTranslations("Admin");

  // Map segments to translation keys or default
  let titleKey = "dashboard";

  if (segment === "orders") titleKey = "orders";
  if (segment === "products") titleKey = "products";
  if (segment === "categories") titleKey = "categories";
  if (segment === "customers") titleKey = "customers";
  if (segment === "admins") titleKey = "admins";
  if (segment === "activity") titleKey = "activity";
  if (segment === "settings") titleKey = "settings";

  return (
    <h1 className="text-lg font-semibold md:text-2xl block">{t(titleKey)}</h1>
  );
}
