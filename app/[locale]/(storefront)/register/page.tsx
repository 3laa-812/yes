"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Link } from "@/i18n/routing";
import { registerCustomer } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("Auth");
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? t("creating") : t("createAccount")}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerCustomer, null);
  const t = useTranslations("Auth");

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t("createAccount")}</CardTitle>
          <CardDescription>{t("enterInfo")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("fullName")}</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
              {state?.fieldErrors?.name && (
                <p className="text-sm text-red-500">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="01xxxxxxxxx"
                required
              />
              {state?.fieldErrors?.phone && (
                <p className="text-sm text-red-500">
                  {state.fieldErrors.phone[0]}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">{t("emailOptional")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
              />
              {state?.fieldErrors?.email && (
                <p className="text-sm text-red-500">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
              />
              {state?.fieldErrors?.password && (
                <p className="text-sm text-red-500">
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>

            {state?.error && (
              <p className="text-sm text-red-500 text-center">{state.error}</p>
            )}

            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="underline">
              {t("signin")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
