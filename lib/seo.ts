import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://yes.shop";
const SUPPORTED_LOCALES = ["en", "ar"] as const;
type AppLocale = (typeof SUPPORTED_LOCALES)[number];

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  return env ? normalizeBaseUrl(env) : DEFAULT_SITE_URL;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const cleanedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanedPath}`;
}

export function localizedPath(locale: AppLocale, path: string): string {
  const cleaned =
    path === "" || path === "/"
      ? ""
      : path.startsWith("/")
        ? path
        : `/${path}`;
  return `/${locale}${cleaned}`;
}

export function localizedUrl(locale: AppLocale, path: string): string {
  return absoluteUrl(localizedPath(locale, path));
}

export function languageAlternates(path: string): NonNullable<Metadata["alternates"]>["languages"] {
  const cleaned =
    path === "" || path === "/"
      ? ""
      : path.startsWith("/")
        ? path
        : `/${path}`;

  return {
    en: localizedPath("en", cleaned),
    ar: localizedPath("ar", cleaned),
  };
}

export function stripHtml(html?: string | null): string | undefined {
  if (!html) return undefined;
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

