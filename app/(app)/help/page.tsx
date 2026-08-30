import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, BookOpen, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServerT } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: `Facturi — ${getServerT()("help.title")}` };
}

export default function HelpPage() {
  const t = getServerT();
  const faq = [
    ["help.q1", "help.a1"],
    ["help.q2", "help.a2"],
    ["help.q3", "help.a3"],
    ["help.q4", "help.a4"],
    ["help.q5", "help.a5"],
    ["help.q6", "help.a6"],
  ];
  const resources = ["help.res1", "help.res2", "help.res3", "help.res4"];

  return (
    <div className="space-y-6">
      <PageHeader title={t("help.title")} description={t("help.subtitle")} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={t("help.faqTitle")}
            description={t("help.faqDesc")}
          />
          <CardBody className="divide-y divide-slate-100">
            {faq.map(([qk, ak]) => (
              <details key={qk} className="group py-3 first:pt-0 last:pb-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-900">
                  {t(qk)}
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {t(ak)}
                </p>
              </details>
            ))}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title={t("help.contactTitle")} />
            <CardBody className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">{t("help.email")}</p>
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
                  <p className="font-medium text-slate-900">{t("help.phone")}</p>
                  <p className="text-slate-600">+243 80 000 00 00</p>
                  <p className="text-xs text-slate-500">{t("help.phoneHours")}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled>
                <MessageCircle className="h-4 w-4" />
                {t("help.chatSoon")}
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t("help.resourcesTitle")} />
            <CardBody className="space-y-2 text-sm">
              {resources.map((key) => (
                <a
                  key={key}
                  href="#"
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  {t(key)}
                </a>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
