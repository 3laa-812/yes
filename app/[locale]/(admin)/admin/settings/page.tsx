import { ChangePasswordForm } from "./_components/ChangePasswordForm";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.Settings" });
  return { title: t("pageTitle") };
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Admin.Settings");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>

      <div className="max-w-2xl">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
