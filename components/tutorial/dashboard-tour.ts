import type { TourStep } from "@/components/tutorial/tutorial-provider";

/** Parcours de découverte affiché une fois, après l'onboarding. */
export const dashboardTourSteps: TourStep[] = [
  {
    selector: '[data-tour="stats"]',
    title: "Votre activité en un coup d'œil",
    body: "Factures émises, montant facturé, encaissé et en attente — tout est résumé ici, en FCFA.",
  },
  {
    selector: '[data-tour="nav"]',
    title: "La navigation",
    body: "Accédez à vos clients, vos factures et vos paramètres depuis ce menu.",
  },
  {
    selector: '[data-tour="create-invoice"]',
    title: "Créer une facture",
    body: "Ce bouton vous emmène directement au formulaire de création d'une nouvelle facture.",
  },
  {
    selector: '[data-tour="recent"]',
    title: "Vos dernières factures",
    body: "Retrouvez ici vos factures récentes et leur statut. Cliquez sur une ligne pour l'ouvrir.",
  },
];

/** Clé localStorage : demande de relancer le tutoriel depuis les Paramètres. */
export const REPLAY_TOUR_KEY = "facturi:replay-tour";
