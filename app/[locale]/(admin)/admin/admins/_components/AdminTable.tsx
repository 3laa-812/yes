"use client";

import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Shield,
  ShieldAlert,
  Key,
  Ban,
  CheckCircle,
} from "lucide-react";
import { User, Role } from "@prisma/client";
import {
  updateAdminRole,
  toggleAdminStatus,
  resetAdminPassword,
} from "../../../admin-actions";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface AdminTableProps {
  admins: User[];
  currentUserRole: Role;
  currentUserId: string;
}

export function AdminTable({
  admins,
  currentUserRole,
  currentUserId,
}: AdminTableProps) {
  const t = useTranslations("Admin.Admins");
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      setLoading(userId);
      await updateAdminRole(userId, newRole);
      toast.success(t("roleUpdated"));
    } catch (error) {
      toast.error(t("roleUpdateFailed"));
    } finally {
      setLoading(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      setLoading(userId);
      await toggleAdminStatus(userId, !currentStatus);
      toast.success(!currentStatus ? t("adminActivated") : t("adminDeactivated"));
    } catch (error) {
      toast.error(t("statusUpdateFailed"));
    } finally {
      setLoading(null);
    }
  };

  const handlePasswordReset = async (userId: string) => {
    // For simplicity, we'll just set a default one or generate random.
    // In a real app, this might open a dialog.
    // Let's prompt for now or just set to 'password123' and notify.
    const newPassword = Math.random().toString(36).slice(-8);
    const confirmed = confirm(
      `Are you sure? New password will be: ${newPassword}`,
    );
    if (!confirmed) return;

    try {
      setLoading(userId);
      await resetAdminPassword(userId, newPassword);
      toast.success(`${t("passwordReset")}: ${newPassword}`, { duration: 10000 });
    } catch (error) {
      toast.error(t("passwordResetFailed"));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("email")}</TableHead>
            <TableHead>{t("role")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell className="font-medium">
                {admin.name || "N/A"}
              </TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {admin.role === Role.OWNER && (
                    <Shield className="h-4 w-4 text-purple-600" />
                  )}
                  {admin.role === Role.MANAGER && (
                    <ShieldAlert className="h-4 w-4 text-blue-600" />
                  )}
                  {admin.role === Role.STAFF && (
                    <UserIcon className="h-4 w-4 text-gray-500" />
                  )}
                  {t(admin.role.toLowerCase() as "owner" | "manager" | "staff")}
                </div>
              </TableCell>
              <TableCell>
                {admin.isActive ? (
                <Badge
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {t("active")}
                </Badge>
              ) : (
                <Badge variant="destructive">{t("inactive")}</Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => navigator.clipboard.writeText(admin.id)}
                    >
                      {t("copyId")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {currentUserRole === Role.OWNER &&
                      admin.id !== currentUserId && (
                        <>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              {t("changeRole")}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuRadioGroup
                                value={admin.role}
                                onValueChange={(val) =>
                                  handleRoleChange(admin.id, val as Role)
                                }
                              >
                              <DropdownMenuRadioItem value={Role.OWNER}>
                                {t("owner")}
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value={Role.MANAGER}>
                                {t("manager")}
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value={Role.STAFF}>
                                {t("staff")}
                              </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusToggle(admin.id, admin.isActive)
                            }
                          >
                            {admin.isActive ? (
                              <Ban className="mr-2 h-4 w-4" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {admin.isActive ? t("deactivate") : t("activate")}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handlePasswordReset(admin.id)}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            {t("resetPassword")}
                          </DropdownMenuItem>
                        </>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
