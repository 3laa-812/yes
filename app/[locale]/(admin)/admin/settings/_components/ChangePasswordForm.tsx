"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { changeOwnPassword } from "../../../admin-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const current = formData.get("currentPassword") as string;
    const newPass = formData.get("newPassword") as string;
    const confirmPass = formData.get("confirmPassword") as string;

    try {
      await changeOwnPassword(current, newPass, confirmPass);
      toast.success("Password changed successfully");
      // Optionally reset form
      const form = document.getElementById(
        "change-password-form",
      ) as HTMLFormElement;
      form?.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Ensure your account is using a long, random password to stay secure.
        </CardDescription>
      </CardHeader>
      <form id="change-password-form" action={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={6}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
