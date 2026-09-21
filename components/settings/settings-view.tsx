"use client";

import { useEffect, useId, useState } from "react";
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
import { useT } from "@/components/providers/i18n-provider";
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
    refreshUser,
  } = useData();
  const { toast } = useToast();
  const t = useT();
  const companyFormId = useId();
  const nameFormId = useId();

  const [form, setForm] = useState<Company>(company);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const saveLogo = (url: string | null) => {
    setForm((f) => ({ ...f, logoUrl: url ?? undefined }));
    updateCompany({ ...form, logoUrl: url ?? undefined });
    toast({ variant: "success", title: url ? t("settings.logoSaved") : t("settings.logoRemoved") });
  };

  const saveAvatar = async (url: string | null) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: url },
    });
    if (error) {
      toast({ variant: "error", title: t("settings.photoFailed") });
      return;
    }
    await refreshUser();
    toast({
      variant: "success",
      title: url ? t("settings.photoSaved") : t("settings.photoRemoved"),
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

  useEffect(() => {
    setFullName(user?.name ?? "");
  }, [user?.name]);

  const saveFullName = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = fullName.trim();
    if (!name || name === user?.name) return;
    setSavingName(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    setSavingName(false);
    if (error) {
      toast({ variant: "error", title: t("settings.fullNameFailed") });
      return;
    }
    await refreshUser();
    toast({ variant: "success", title: t("settings.fullNameSaved") });
  };

  const set = <K extends keyof Company>(key: K, value: Company[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ variant: "error", title: t("settings.nameRequiredToast") });
      return;
    }
    updateCompany({
      ...form,
      name: form.name.trim(),
      defaultTvaRate: Number(form.defaultTvaRate) || 0,
      paymentTermsDays: Number(form.paymentTermsDays) || 0,
    });
    toast({ variant: "success", title: t("settings.savedToast") });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("settings.title")}
        description={t("settings.subtitle")}
        actions={
          <Button type="submit" form={companyFormId}>
            {t("settings.save")}
          </Button>
        }
      />

      {/*
        Formulaire "entreprise" : le <form> encadre la carte Identité, mais
        les champs des cartes Contact/Facturation plus bas lui sont aussi
        rattachés via l'attribut HTML `form` (standard, pas besoin d'être
        un descendant DOM) — un seul Entrée/Enregistrer pour les trois.
      */}
      <form id={companyFormId} onSubmit={handleSave}>
        <Card>
          <CardHeader title={t("settings.identityTitle")} />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("settings.tradeName")}
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <Input
              label={t("settings.legalName")}
              value={form.legalName}
              onChange={(e) => set("legalName", e.target.value)}
            />
            <Input
              label={t("settings.rccm")}
              value={form.rccm}
              onChange={(e) => set("rccm", e.target.value)}
              placeholder="CD/KIN/RCCM/…"
            />
            <Input
              label={t("settings.nif")}
              value={form.nif}
              onChange={(e) => set("nif", e.target.value)}
            />
            <Input
              label={t("settings.idNat")}
              value={form.idNat}
              onChange={(e) => set("idNat", e.target.value)}
              containerClassName="sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <ImageUpload
                label={t("settings.logoLabel")}
                kind="logo"
                shape="square"
                value={form.logoUrl}
                onChange={saveLogo}
                hint={t("settings.logoHint")}
              />
            </div>
          </CardBody>
        </Card>
      </form>

      <Card>
        <CardHeader
          title={t("settings.profileTitle")}
          description={t("settings.profileDesc")}
        />
        <CardBody className="space-y-5">
          <ImageUpload
            label={t("settings.avatarLabel")}
            kind="avatar"
            shape="circle"
            value={user?.avatarUrl ?? null}
            onChange={saveAvatar}
          />
          <form
            id={nameFormId}
            onSubmit={saveFullName}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <Input
              label={t("settings.fullName")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("settings.fullNamePlaceholder")}
              containerClassName="flex-1"
            />
            <Button
              type="submit"
              variant="outline"
              className="shrink-0"
              loading={savingName}
              disabled={!fullName.trim() || fullName.trim() === user?.name}
            >
              {t("settings.save")}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("settings.contactTitle")} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input
            form={companyFormId}
            label={t("settings.address")}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            containerClassName="sm:col-span-2"
          />
          <Input
            form={companyFormId}
            label={t("settings.city")}
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
          <Input
            form={companyFormId}
            label={t("settings.country")}
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
          />
          <Input
            form={companyFormId}
            label={t("settings.phone")}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Input
            form={companyFormId}
            label={t("settings.email")}
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t("settings.billingTitle")}
          description={t("settings.billingDesc")}
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Select
            form={companyFormId}
            label={t("settings.currency")}
            options={[
              { value: "CDF", label: t("settings.currencyCDF") },
              { value: "XOF", label: t("settings.currencyXOF") },
              { value: "XAF", label: t("settings.currencyXAF") },
            ]}
            value={form.currency}
            onChange={(e) => set("currency", e.target.value as Company["currency"])}
          />
          <Input
            form={companyFormId}
            label={t("settings.tvaRate")}
            type="number"
            min={0}
            suffix="%"
            value={Number.isNaN(form.defaultTvaRate) ? "" : form.defaultTvaRate}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const raw = e.target.value;
              set("defaultTvaRate", raw === "" ? NaN : Number(raw));
            }}
          />
          <Input
            form={companyFormId}
            label={t("settings.invoicePrefix")}
            value={form.invoicePrefix}
            onChange={(e) => set("invoicePrefix", e.target.value)}
            hint={t("settings.invoicePrefixHint")}
          />
          <Input
            form={companyFormId}
            label={t("settings.paymentTerms")}
            type="number"
            min={0}
            suffix={t("settings.paymentTermsSuffix")}
            value={Number.isNaN(form.paymentTermsDays) ? "" : form.paymentTermsDays}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const raw = e.target.value;
              set("paymentTermsDays", raw === "" ? NaN : Number(raw));
            }}
          />
          <Textarea
            form={companyFormId}
            label={t("settings.bankDetails")}
            value={form.bankDetails ?? ""}
            onChange={(e) => set("bankDetails", e.target.value)}
            containerClassName="sm:col-span-2"
            placeholder={t("settings.bankDetailsPlaceholder")}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t("settings.helpTitle")}
          description={t("settings.helpDesc")}
          action={
            <Button type="button" variant="outline" onClick={replayTutorial}>
              {t("settings.replayTutorial")}
            </Button>
          }
        />
        <CardBody className="border-t border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                {t("settings.demoDataName")}
              </p>
              <p className="text-sm text-slate-500">
                {t("settings.demoDataDesc")}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setResetOpen(true)}
            >
              {t("settings.loadDemo")}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="border-rose-200">
        <CardHeader
          title={t("settings.dangerTitle")}
          description={t("settings.dangerDesc")}
          action={
            <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
              {t("settings.deleteAccount")}
            </Button>
          }
        />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" form={companyFormId}>
          {t("settings.saveAll")}
        </Button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemoData();
          setResetOpen(false);
          toast({ variant: "success", title: t("settings.demoLoaded") });
        }}
        title={t("settings.confirmLoadTitle")}
        message={t("settings.confirmLoadMsg")}
        confirmLabel={t("settings.confirmLoadBtn")}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        loading={deleting}
        onConfirm={async () => {
          setDeleting(true);
          await deleteAccount();
        }}
        title={t("settings.confirmDeleteTitle")}
        message={t("settings.confirmDeleteMsg", { email: user?.email ?? "" })}
        confirmLabel={t("settings.confirmDeleteBtn")}
      />
    </div>
  );
}
