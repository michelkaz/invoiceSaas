"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Building2,
  PartyPopper,
  ArrowRight,
  Check,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/providers/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import type { Company } from "@/lib/data/types";

type CompanyForm = Pick<
  Company,
  "name" | "city" | "country" | "currency" | "invoicePrefix"
>;

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  const STEPS = [
    t("onboarding.stepWelcome"),
    t("onboarding.stepCompany"),
    t("onboarding.stepDone"),
  ];
  const [step, setStep] = useState(0);
  const [uid, setUid] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CompanyForm>({
    name: "",
    city: "",
    country: "",
    currency: "CDF",
    invoicePrefix: "FAC",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
    supabase
      .from("companies")
      .select("name, city, country, currency, invoice_prefix")
      .maybeSingle()
      .then(({ data }) => {
        if (data)
          setForm((f) => ({
            name: data.name || f.name,
            city: data.city || f.city,
            country: data.country || f.country,
            currency: (data.currency as Company["currency"]) || f.currency,
            invoicePrefix: data.invoice_prefix || f.invoicePrefix,
          }));
      });
  }, []);

  const set = <K extends keyof CompanyForm>(k: K, v: CompanyForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const finish = async (saveCompany: boolean) => {
    if (!uid) return;
    setSaving(true);
    const supabase = createClient();
    if (saveCompany) {
      await supabase
        .from("companies")
        .update({
          name: form.name.trim(),
          city: form.city.trim(),
          country: form.country.trim(),
          currency: form.currency,
          invoice_prefix: form.invoicePrefix.trim() || "FAC",
        })
        .eq("owner_id", uid);
    }
    const { error } = await supabase
      .from("companies")
      .update({ onboarding_completed: true })
      .eq("owner_id", uid);
    setSaving(false);
    if (error) {
      toast({ variant: "error", title: t("onboarding.saveFailed") });
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Card>
      <CardBody className="space-y-6">
        {/* Progression */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                  i < step
                    ? "bg-brand-600 text-white"
                    : i === step
                      ? "bg-brand-100 text-brand-700"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={`h-0.5 flex-1 rounded ${i < step ? "bg-brand-600" : "bg-slate-100"}`}
                />
              )}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Rocket className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {t("onboarding.welcomeTitle")}
              </h1>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                {t("onboarding.welcomeBody")}
              </p>
            </div>
            <Button onClick={() => setStep(1)} className="w-full">
              {t("onboarding.start")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-base font-semibold text-slate-900">
                  {t("onboarding.companyTitle")}
                </h1>
                <p className="text-sm text-slate-500">
                  {t("onboarding.companySubtitle")}
                </p>
              </div>
            </div>

            <Input
              label={t("onboarding.tradeName")}
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t("onboarding.tradeNamePlaceholder")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t("onboarding.city")}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
              <Input
                label={t("onboarding.country")}
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={t("onboarding.currency")}
                options={[
                  { value: "CDF", label: t("settings.currencyCDF") },
                  { value: "XOF", label: t("settings.currencyXOF") },
                  { value: "XAF", label: t("settings.currencyXAF") },
                ]}
                value={form.currency}
                onChange={(e) =>
                  set("currency", e.target.value as Company["currency"])
                }
              />
              <Input
                label={t("onboarding.prefix")}
                value={form.invoicePrefix}
                onChange={(e) => set("invoicePrefix", e.target.value)}
                hint={t("onboarding.prefixHint")}
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => void finish(false)}
                className="text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                {t("onboarding.skip")}
              </button>
              <Button
                onClick={() => {
                  if (!form.name.trim()) {
                    toast({
                      variant: "error",
                      title: t("onboarding.nameRequired"),
                    });
                    return;
                  }
                  setStep(2);
                }}
              >
                {t("onboarding.continue")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <PartyPopper className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {t("onboarding.doneTitle")}
              </h1>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                {t("onboarding.doneBody")}
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => void finish(true)}
                loading={saving}
                className="w-full"
              >
                {t("onboarding.goDashboard")}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                {t("onboarding.goBack")}
              </button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
