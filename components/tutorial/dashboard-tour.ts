import type { TourStep } from "@/components/tutorial/tutorial-provider";
import type { Translate } from "@/lib/i18n";

/** Parcours de découverte affiché une fois, après l'onboarding. */
export function buildDashboardTour(t: Translate): TourStep[] {
  return [
    {
      selector: '[data-tour="stats"]',
      title: t("tour.statsTitle"),
      body: t("tour.statsBody"),
    },
    {
      selector: '[data-tour="nav"]',
      title: t("tour.navTitle"),
      body: t("tour.navBody"),
    },
    {
      selector: '[data-tour="create-invoice"]',
      title: t("tour.createTitle"),
      body: t("tour.createBody"),
    },
    {
      selector: '[data-tour="recent"]',
      title: t("tour.recentTitle"),
      body: t("tour.recentBody"),
    },
  ];
}

/** Clé localStorage : demande de relancer le tutoriel depuis les Paramètres. */
export const REPLAY_TOUR_KEY = "facturi:replay-tour";
