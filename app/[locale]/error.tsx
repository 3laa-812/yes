"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Common");

  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">
        {t("error") || "Something went wrong!"}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        An unexpected error occurred. Please try again or contact support if the
        problem persists.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          Go Home
        </Button>
      </div>
    </div>
  );
}
