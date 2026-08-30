"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ImagePlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useData } from "@/components/providers/data-provider";
import { useToast } from "@/components/ui/toast";
import { REPLAY_TOUR_KEY } from "@/components/tutorial/dashboard-tour";
import type { Company } from "@/lib/data/types";

export function SettingsView() {
  const router = useRouter();
  const { company, user, updateCompany, resetDemoData, setTutorialSeen, deleteAccount } =
    useData();
  const { toast } = useToast();

  const [form, setForm] = useState<Company>(company);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const replayTutorial = () => {
    setTutorialSeen(false);
    try {
      localStorage.setItem(REPLAY_TOUR_KEY, "1");
    } catch {
      /* stockage indisponible */
    }
    router.push("/dashboard");
  };

  useEffect(() => {
    setForm(company);
  }, [company]);

  const set = <K extends keyof Company>(key: K, value: Company[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ variant: "error", title: "Le nom de l'entreprise est requis." });
      return;
    }
    updateCompany({
      ...form,
      name: form.name.trim(),
      defaultTvaRate: Number(form.defaultTvaRate) || 0,
      paymentTermsDays: Number(form.paymentTermsDays) || 0,
    });
    toast({ variant: "success", title: "Paramètres enregistrés" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        description="Ces informations apparaissent sur vos factures."
        actions={<Button onClick={handleSave}>Enregistrer</Button>}
      />

      <Card>
        <CardHeader title="Identité de l'entreprise" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nom commercial"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <Input
            label="Raison sociale"
            value={form.legalName}
            onChange={(e) => set("legalName", e.target.value)}
          />
          <Input
            label="RCCM"
            value={form.rccm}
            onChange={(e) => set("rccm", e.target.value)}
            placeholder="CD/KIN/RCCM/…"
          />
          <Input
            label="N° Impôt (NIF)"
            value={form.nif}
            onChange={(e) => set("nif", e.target.value)}
          />
          <Input
            label="ID NAT"
            value={form.idNat}
            onChange={(e) => set("idNat", e.target.value)}
            containerClassName="sm:col-span-2"
          />
          <div className="sm:col-span-2">
            <p className="mb-1.5 block text-sm font-medium text-slate-700">Logo</p>
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-slate-300 p-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400">
                <Building2 className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <Button variant="outline" size="sm" disabled>
                  <ImagePlus className="h-4 w-4" />
                  Téléverser un logo
                </Button>
                <p className="mt-1 text-xs text-slate-400">
                  Disponible après la connexion du stockage (Supabase).
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Coordonnées" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Adresse"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Ville"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
          <Input
            label="Pays"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
          />
          <Input
            label="Téléphone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Facturation"
          description="Valeurs appliquées par défaut aux nouvelles factures."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Devise"
            options={[
              { value: "CDF", label: "Franc congolais — CDF (RDC)" },
              { value: "XOF", label: "Franc CFA — XOF (UEMOA)" },
              { value: "XAF", label: "Franc CFA — XAF (CEMAC)" },
            ]}
            value={form.currency}
            onChange={(e) => set("currency", e.target.value as Company["currency"])}
          />
          <Input
            label="Taux de TVA par défaut"
            type="number"
            min={0}
            suffix="%"
            value={form.defaultTvaRate}
            onChange={(e) => set("defaultTvaRate", Number(e.target.value))}
          />
          <Input
            label="Préfixe de numérotation"
            value={form.invoicePrefix}
            onChange={(e) => set("invoicePrefix", e.target.value)}
            hint="Ex. FAC → FAC-2026-0001"
          />
          <Input
            label="Délai de paiement"
            type="number"
            min={0}
            suffix="jours"
            value={form.paymentTermsDays}
            onChange={(e) => set("paymentTermsDays", Number(e.target.value))}
          />
          <Textarea
            label="Coordonnées bancaires"
            value={form.bankDetails ?? ""}
            onChange={(e) => set("bankDetails", e.target.value)}
            containerClassName="sm:col-span-2"
            placeholder="Banque, IBAN, BIC…"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Aide & découverte"
          description="Revoir la visite guidée du tableau de bord."
          action={
            <Button variant="outline" onClick={replayTutorial}>
              Revoir le tutoriel
            </Button>
          }
        />
        <CardBody className="border-t border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Données de démonstration
              </p>
              <p className="text-sm text-slate-500">
                Remplace vos données actuelles par un jeu d&apos;exemple (8 clients,
                14 factures).
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => setResetOpen(true)}
            >
              Charger les données de démo
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="border-rose-200">
        <CardHeader
          title="Zone de danger"
          description="La suppression du compte efface définitivement vos clients, factures et paramètres."
          action={
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              Supprimer mon compte
            </Button>
          }
        />
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Enregistrer les paramètres</Button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemoData();
          setResetOpen(false);
          toast({ variant: "success", title: "Données de démonstration chargées" });
        }}
        title="Charger les données de démo"
        message="Vos clients et factures actuels seront remplacés par le jeu de démonstration."
        confirmLabel="Charger"
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        loading={deleting}
        onConfirm={async () => {
          setDeleting(true);
          await deleteAccount();
        }}
        title="Supprimer définitivement mon compte"
        message={
          <>
            Le compte <strong>{user?.email}</strong> et toutes ses données
            (clients, factures, paramètres) seront <strong>définitivement</strong>{" "}
            supprimés. Cette action est irréversible.
          </>
        }
        confirmLabel="Supprimer mon compte"
      />
    </div>
  );
}
