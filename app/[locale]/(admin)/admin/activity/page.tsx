import { auth } from "@/auth";
import db from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { ActivityLogTable } from "./_components/ActivityLogTable";
import { Metadata } from "next";
import { AdminShell } from "../_components/AdminShell";

export const metadata: Metadata = {
  title: "Activity Logs",
};

export default async function ActivityPage({
  params,
}: {
  params: { locale: string };
}) {
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
    <AdminShell locale={params.locale} titleKey="activity">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
        </div>
        <ActivityLogTable logs={logs} />
      </div>
    </AdminShell>
  );
}
