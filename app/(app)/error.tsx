"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <EmptyState
        icon={AlertTriangle}
        title="Une erreur est survenue"
        description="Nous n'avons pas pu afficher cette page. Réessayez ; si le problème persiste, revenez au tableau de bord."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={reset}>
              Réessayer
            </Button>
            <Button href="/dashboard">Tableau de bord</Button>
          </div>
        }
      />
    </Card>
  );
}
