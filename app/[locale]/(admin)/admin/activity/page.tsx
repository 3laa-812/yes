import { auth } from "@/auth";
import db from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ActivityLogTable } from "./_components/ActivityLogTable";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.Activity" });
  return { title: t("activityLogs") };
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Admin.Activity");
  const session = await auth();

  if (!session?.user || session.user.role !== Role.OWNER) {
    redirect("/admin/dashboard");
  }

  const logs = await db.activityLog.findMany({
    take: 100,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("activityLogs")}
        </h1>
      </div>
      <ActivityLogTable logs={logs} />
    </div>
  );
}
