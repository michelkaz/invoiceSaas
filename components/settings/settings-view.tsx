"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { useData } from "@/components/providers/data-provider";
import { useToast } from "@/components/ui/toast";
import { REPLAY_TOUR_KEY } from "@/components/tutorial/dashboard-tour";
import { createClient } from "@/lib/supabase/client";
import type { Company } from "@/lib/data/types";

export function SettingsView() {
  const router = useRouter();
  const {
    company,
    user,
    updateCompany,
    resetDemoData,
    setTutorialSeen,
    deleteAccount,
    refresh,
  } = useData();
  const { toast } = useToast();

  const [form, setForm] = useState<Company>(company);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const saveLogo = (url: string | null) => {
    setForm((f) => ({ ...f, logoUrl: url ?? undefined }));
    updateCompany({ ...form, logoUrl: url ?? undefined });
    toast({ variant: "success", title: url ? "Logo enregistré" : "Logo retiré" });
  };

  const saveAvatar = async (url: string | null) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: url },
    });
    if (error) {
      toast({ variant: "error", title: "Enregistrement de la photo impossible" });
      return;
    }
    await refresh();
    toast({
      variant: "success",
      title: url ? "Photo de profil enregistrée" : "Photo retirée",
    });
  };

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
            <ImageUpload
              label="Logo de l'entreprise"
              kind="logo"
              shape="square"
              value={form.logoUrl}
              onChange={saveLogo}
              hint="Apparaît en en-tête de vos factures et de leur PDF."
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Votre profil"
          description="Photo affichée dans l'application (elle n'apparaît pas sur les factures)."
        />
        <CardBody>
          <ImageUpload
            label="Photo de profil"
            kind="avatar"
            shape="circle"
            value={user?.avatarUrl ?? null}
            onChange={saveAvatar}
          />
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
