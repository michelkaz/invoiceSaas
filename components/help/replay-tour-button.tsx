"use client";

import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/components/providers/data-provider";
import { useT } from "@/components/providers/i18n-provider";
import { REPLAY_TOUR_KEY } from "@/components/tutorial/dashboard-tour";

export function ReplayTourButton() {
  const router = useRouter();
  const t = useT();
  const { setTutorialSeen } = useData();

  const replay = () => {
    setTutorialSeen(false);
    try {
      localStorage.setItem(REPLAY_TOUR_KEY, "1");
    } catch {
      /* stockage indisponible */
    }
    router.push("/dashboard");
  };

  return (
    <Button variant="outline" className="w-full" onClick={replay}>
      <Compass className="h-4 w-4" />
      {t("settings.replayTutorial")}
    </Button>
  );
}
