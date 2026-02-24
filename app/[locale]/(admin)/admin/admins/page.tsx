import { auth } from "@/auth";
import db from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { AdminTable } from "./_components/AdminTable";
import { Metadata } from "next";
import { AdminShell } from "../_components/AdminShell";

export const metadata: Metadata = {
  title: "Admin Management",
};

const AddAdminDialog = dynamic(() =>
  import("./_components/AddAdminDialog").then((mod) => mod.AddAdminDialog),
);

export default async function AdminsPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.OWNER) {
    redirect("/admin/dashboard");
  }

  const admins = await db.user.findMany({
    where: {
      role: {
        in: [Role.OWNER, Role.MANAGER, Role.STAFF],
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <AdminShell locale={params.locale} titleKey="admins">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
          <AddAdminDialog />
        </div>
        <AdminTable
          admins={admins}
          currentUserRole={session.user.role}
          currentUserId={session.user.id || ""}
        />
      </div>
    </AdminShell>
  );
}
