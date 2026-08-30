"use client";

import Link from "next/link";
import { Check, Circle, X } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { useData } from "@/components/providers/data-provider";
import { useT } from "@/components/providers/i18n-provider";

interface Item {
  label: string;
  href: string;
  done: boolean;
}

export function OnboardingChecklist() {
  const t = useT();
  const { company, clients, invoices, onboardingCompleted, completeOnboarding } =
    useData();

  if (onboardingCompleted) return null;

  const items: Item[] = [
    {
      label: t("checklist.itemCompany"),
      href: "/settings",
      done: Boolean(company.name),
    },
    {
      label: t("checklist.itemClient"),
      href: "/clients",
      done: clients.length > 0,
    },
    {
      label: t("checklist.itemInvoice"),
      href: "/invoices/new",
      done: invoices.length > 0,
    },
  ];
  const doneCount = items.filter((i) => i.done).length;

  return (
    <Card className="border-brand-100 bg-brand-50/40">
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-slate-900">
              {t("checklist.title", { done: doneCount, total: items.length })}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {t("checklist.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={completeOnboarding}
            aria-label={t("checklist.hide")}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-white"
              >
                {item.done ? (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                )}
                <span
                  className={
                    item.done
                      ? "text-slate-400 line-through"
                      : "font-medium text-slate-700"
                  }
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {doneCount === items.length && (
          <button
            type="button"
            onClick={completeOnboarding}
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {t("checklist.finish")}
          </button>
        )}
      </CardBody>
    </Card>
  );
}
