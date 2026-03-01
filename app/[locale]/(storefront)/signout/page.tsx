import type { Metadata } from "next";
import { handleSignOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Sign Out | YES",
  description: "Sign out of your YES customer account securely.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignOutPage() {
  const t = await getTranslations("Auth");

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>{t("signOutTitle")}</CardTitle>
          <CardDescription>{t("signOutConfirm")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleSignOut}>
            <Button variant="destructive" className="w-full">
              {t("signOutTitle")}
            </Button>
          </form>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">{t("cancel")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
