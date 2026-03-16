import { OffersManager } from "./_components/OffersManager";
import { getAdminOffers } from "@/app/actions/offers";
import db from "@/lib/db";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const offers = await getAdminOffers();
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  const t = await getTranslations("Admin.Offers");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">{t("title")}</h1>
      </div>
      <OffersManager initialOffers={offers} products={products} />
    </div>
  );
}
