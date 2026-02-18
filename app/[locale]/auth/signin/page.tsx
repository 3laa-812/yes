"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";
import { useTranslations } from "next-intl";

export default function SignInPage() {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      // Let global error handling or UI patterns show error if desired
      return;
    }

    router.push(result?.url || callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <FadeIn className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg ring-1 ring-gray-900/5">
        <div className="text-center">
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {t("adminAccess")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{t("adminSignInDesc")}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                {t("emailAddress")}
              </label>
              <input
                id="email-address"
                name="identifier"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-t-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder={t("emailPlaceholder")}
                defaultValue="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-b-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder={t("passwordPlaceholder")}
                defaultValue="admin"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative flex w-full justify-center"
              disabled={loading}
            >
              {loading ? t("signingIn") : t("signin")}
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>{t("defaultCredentials")}</p>
            <p>{t("defaultEmail")}</p>
            <p>{t("defaultPassword")}</p>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
