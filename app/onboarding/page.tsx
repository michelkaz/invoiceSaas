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
import { createClient } from "@/lib/supabase/client";
import type { Company } from "@/lib/data/types";

type CompanyForm = Pick<
  Company,
  "name" | "city" | "country" | "currency" | "invoicePrefix"
>;

const STEPS = ["Bienvenue", "Votre entreprise", "C'est parti"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
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
      toast({ variant: "error", title: "Enregistrement impossible" });
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
                Bienvenue sur Facturi 👋
              </h1>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                En trois étapes, votre espace de facturation en francs
                congolais est prêt. Configurons d&apos;abord votre entreprise.
              </p>
            </div>
            <Button onClick={() => setStep(1)} className="w-full">
              Commencer
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
                  Votre entreprise
                </h1>
                <p className="text-sm text-slate-500">
                  Ces informations apparaîtront sur vos factures.
                </p>
              </div>
            </div>

            <Input
              label="Nom commercial"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex. Atelier Baobab"
            />
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Devise"
                options={[
                  { value: "CDF", label: "Franc congolais — CDF (RDC)" },
                  { value: "XOF", label: "Franc CFA — XOF (UEMOA)" },
                  { value: "XAF", label: "Franc CFA — XAF (CEMAC)" },
                ]}
                value={form.currency}
                onChange={(e) =>
                  set("currency", e.target.value as Company["currency"])
                }
              />
              <Input
                label="Préfixe de numérotation"
                value={form.invoicePrefix}
                onChange={(e) => set("invoicePrefix", e.target.value)}
                hint="Ex. FAC → FAC-2026-0001"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => void finish(false)}
                className="text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Passer cette étape
              </button>
              <Button
                onClick={() => {
                  if (!form.name.trim()) {
                    toast({
                      variant: "error",
                      title: "Le nom de l'entreprise est requis.",
                    });
                    return;
                  }
                  setStep(2);
                }}
              >
                Continuer
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
                Tout est prêt
              </h1>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                Prochaines étapes conseillées : ajoutez votre premier client,
                puis créez votre première facture. Un guide vous attend sur le
                tableau de bord.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => void finish(true)}
                loading={saving}
                className="w-full"
              >
                Aller au tableau de bord
                <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Revenir en arrière
              </button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
