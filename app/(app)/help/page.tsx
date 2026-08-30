import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, BookOpen, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Aide & support — Facturi",
};

const FAQ = [
  {
    q: "Comment créer ma première facture ?",
    a: "Ouvrez « Factures » puis « Créer une facture ». Choisissez un client, ajoutez vos lignes (description, quantité, prix unitaire) : le sous-total, la TVA à 18 % et le total TTC se calculent automatiquement.",
  },
  {
    q: "Comment fonctionne la TVA à 18 % ?",
    a: "La TVA est appliquée au sous-total hors taxes. Le taux par défaut (18 %) est modifiable dans Paramètres → Facturation, et reste enregistré par facture.",
  },
  {
    q: "Que signifient les statuts des factures ?",
    a: "Brouillon : non finalisée. Envoyée : transmise au client, en attente de paiement. Payée : réglée. En retard : envoyée mais échéance dépassée. Vous pouvez changer le statut depuis la liste ou le détail d'une facture.",
  },
  {
    q: "Dans quelle devise sont affichés les montants ?",
    a: "En francs CFA (FCFA), arrondis à l'unité, au format « 250 000 FCFA ». Le choix XOF (UEMOA) ou XAF (CEMAC) se fait dans les Paramètres.",
  },
  {
    q: "Mes données sont-elles enregistrées ?",
    a: "Pour l'instant, les données de démonstration sont stockées localement dans votre navigateur. La synchronisation avec un compte sécurisé (Supabase) arrive dans une prochaine étape.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Aide & support"
        description="Trouvez une réponse ou contactez notre équipe."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Questions fréquentes"
            description="Les réponses aux questions les plus courantes."
          />
          <CardBody className="divide-y divide-slate-100">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-3 first:pt-0 last:pb-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-900">
                  {item.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.a}
                </p>
              </details>
            ))}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Nous contacter" />
            <CardBody className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">Email</p>
                  <a
                    href="mailto:support@facturi.app"
                    className="text-brand-600 hover:text-brand-700"
                  >
                    support@facturi.app
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">Téléphone</p>
                  <p className="text-slate-600">+221 33 800 00 00</p>
                  <p className="text-xs text-slate-400">Lun–Ven, 9h–18h GMT</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled>
                <MessageCircle className="h-4 w-4" />
                Chat en direct (bientôt)
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Ressources" />
            <CardBody className="space-y-2 text-sm">
              {[
                "Guide de démarrage rapide",
                "Bien remplir une facture",
                "Gérer ses clients",
                "Comprendre la TVA en zone UEMOA",
              ].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  {label}
                </a>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
