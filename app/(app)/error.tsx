"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useT } from "@/components/providers/i18n-provider";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <EmptyState
        icon={AlertTriangle}
        title={t("errors.appTitle")}
        description={t("errors.appDesc")}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={reset}>
              {t("errors.retry")}
            </Button>
            <Button href="/dashboard">{t("errors.dashboard")}</Button>
          </div>
        }
      />
    </Card>
  );
}
