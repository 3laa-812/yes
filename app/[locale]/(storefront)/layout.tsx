import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { FadeIn } from "@/components/ui/motion";
import { auth } from "@/auth";
import Script from "next/script";
import { FacebookPixelTracker } from "@/components/FacebookPixelTracker";
import { FB_PIXEL_ID } from "@/lib/facebookPixel";

import db from "@/lib/db";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";

export const dynamic = "force-dynamic";

import { unstable_cache } from "next/cache";

const getCategories = unstable_cache(
  async () => {
    return await db.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { displayOrder: "asc" } } },
      orderBy: { displayOrder: "asc" },
    });
  },
  ["storefront-categories"],
  { revalidate: 3600, tags: ["categories"] },
);

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      {FB_PIXEL_ID && (
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
          `,
          }}
        />
      )}
      <FacebookPixelTracker />
      <Navbar user={session?.user} categories={categories} />
      <FadeIn className="flex-1">{children}</FadeIn>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}
