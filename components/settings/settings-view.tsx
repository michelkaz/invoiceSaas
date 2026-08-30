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
    refresh,
  } = useData();
  const { toast } = useToast();
  const t = useT();

  const [form, setForm] = useState<Company>(company);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    await refresh();
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

  const set = <K extends keyof Company>(key: K, value: Company[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
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
        actions={<Button onClick={handleSave}>{t("settings.save")}</Button>}
      />

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

      <Card>
        <CardHeader
          title={t("settings.profileTitle")}
          description={t("settings.profileDesc")}
        />
        <CardBody>
          <ImageUpload
            label={t("settings.avatarLabel")}
            kind="avatar"
            shape="circle"
            value={user?.avatarUrl ?? null}
            onChange={saveAvatar}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("settings.contactTitle")} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("settings.address")}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            containerClassName="sm:col-span-2"
          />
          <Input
            label={t("settings.city")}
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
          <Input
            label={t("settings.country")}
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
          />
          <Input
            label={t("settings.phone")}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Input
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
            label={t("settings.tvaRate")}
            type="number"
            min={0}
            suffix="%"
            value={form.defaultTvaRate}
            onChange={(e) => set("defaultTvaRate", Number(e.target.value))}
          />
          <Input
            label={t("settings.invoicePrefix")}
            value={form.invoicePrefix}
            onChange={(e) => set("invoicePrefix", e.target.value)}
            hint={t("settings.invoicePrefixHint")}
          />
          <Input
            label={t("settings.paymentTerms")}
            type="number"
            min={0}
            suffix={t("settings.paymentTermsSuffix")}
            value={form.paymentTermsDays}
            onChange={(e) => set("paymentTermsDays", Number(e.target.value))}
          />
          <Textarea
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
            <Button variant="outline" onClick={replayTutorial}>
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
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              {t("settings.deleteAccount")}
            </Button>
          }
        />
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>{t("settings.saveAll")}</Button>
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
