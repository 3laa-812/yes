import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/en", "/en/", "/ar", "/ar/"],
        disallow: [
          "/api/",
          "/en/auth/",
          "/ar/auth/",
          "/en/admin/",
          "/ar/admin/",
          "/en/checkout",
          "/en/checkout/",
          "/ar/checkout",
          "/ar/checkout/",
          "/en/orders",
          "/en/orders/",
          "/ar/orders",
          "/ar/orders/",
          "/en/account",
          "/en/account/",
          "/ar/account",
          "/ar/account/",
          "/en/login",
          "/en/register",
          "/en/signout",
          "/ar/login",
          "/ar/register",
          "/ar/signout",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

