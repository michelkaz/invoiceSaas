"use client";

import { useState } from "react";
import { Eye, Download, Printer, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Client, Company, Invoice } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";

/** Charge react-pdf et le gabarit à la demande (hors du bundle de la page). */
async function buildBlob(
  invoice: Invoice,
  company: Company,
  client: Client | undefined,
  locale: Locale,
): Promise<Blob> {
  const [{ pdf }, { InvoiceDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/pdf/invoice-document"),
  ]);
  return pdf(
    <InvoiceDocument
      invoice={invoice}
      company={company}
      client={client}
      locale={locale}
    />,
  ).toBlob();
}

export function InvoicePdfActions({
  invoice,
  company,
  client,
}: {
  invoice: Invoice;
  company: Company;
  client?: Client;
}) {
  const { toast } = useToast();
  const { t, locale } = useI18n();
  const [busy, setBusy] = useState<null | "download" | "print" | "preview">(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTo, setSendTo] = useState(client?.email ?? "");
  const [sendMsg, setSendMsg] = useState("");
  const [sending, setSending] = useState(false);

  const fileName = `${invoice.number}.pdf`;

  const withBlob = async (fn: (blob: Blob) => void, kind: typeof busy) => {
    try {
      setBusy(kind);
      const blob = await buildBlob(invoice, company, client, locale);
      fn(blob);
    } catch (e) {
      console.error(e);
      toast({ variant: "error", title: t("pdfActions.genFailed") });
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = () =>
    withBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, "download");

  const handlePrint = () =>
    withBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const frame = document.createElement("iframe");
      frame.style.position = "fixed";
      frame.style.right = "0";
      frame.style.bottom = "0";
      frame.style.width = "0";
      frame.style.height = "0";
      frame.style.border = "0";
      frame.src = url;
      frame.onload = () => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(frame);
          URL.revokeObjectURL(url);
        }, 60000);
      };
      document.body.appendChild(frame);
    }, "print");

  const handlePreview = () =>
    withBlob((blob) => {
      setPreviewUrl(URL.createObjectURL(blob));
      setPreviewOpen(true);
    }, "preview");

  const closePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSend = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sendTo.trim())) {
      toast({ variant: "error", title: t("pdfActions.invalidEmail") });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: sendTo.trim(), message: sendMsg.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast({
          variant: "error",
          title: t("pdfActions.sendFailed"),
          description: data.error ?? t("pdfActions.retryLater"),
        });
      } else {
        toast({
          variant: "success",
          title: t("pdfActions.sentTitle"),
          description: `${invoice.number} → ${sendTo.trim()}`,
        });
        setSendOpen(false);
        setSendMsg("");
      }
    } catch {
      toast({ variant: "error", title: t("pdfActions.sendFailed") });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handlePreview} loading={busy === "preview"}>
        <Eye className="h-4 w-4" />
        {t("pdfActions.preview")}
      </Button>
      <Button variant="outline" onClick={handleDownload} loading={busy === "download"}>
        <Download className="h-4 w-4" />
        {t("pdfActions.download")}
      </Button>
      <Button variant="outline" onClick={handlePrint} loading={busy === "print"}>
        <Printer className="h-4 w-4" />
        {t("pdfActions.print")}
      </Button>
      <Button variant="outline" onClick={() => setSendOpen(true)}>
        <Send className="h-4 w-4" />
        {t("pdfActions.send")}
      </Button>

      <Modal
        open={previewOpen}
        onClose={closePreview}
        title={t("pdfActions.previewTitle", { number: invoice.number })}
        size="xl"
      >
        {previewUrl && (
          <iframe
            title={t("pdfActions.previewAlt", { number: invoice.number })}
            src={previewUrl}
            className="h-[70vh] w-full rounded-xl border border-slate-200"
          />
        )}
      </Modal>

      <Modal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        title={t("pdfActions.sendTitle")}
        description={t("pdfActions.sendDesc", { number: invoice.number })}
        footer={
          <>
            <Button variant="outline" onClick={() => setSendOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSend} loading={sending}>
              {t("pdfActions.sendBtn")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t("pdfActions.recipient")}
            type="email"
            value={sendTo}
            onChange={(e) => setSendTo(e.target.value)}
            placeholder={t("pdfActions.recipientPlaceholder")}
          />
          <Textarea
            label={t("pdfActions.message")}
            value={sendMsg}
            onChange={(e) => setSendMsg(e.target.value)}
            placeholder={t("pdfActions.messagePlaceholder")}
          />
        </div>
      </Modal>
    </>
  );
}
