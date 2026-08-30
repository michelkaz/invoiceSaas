"use client";

import { useState } from "react";
import { Eye, Download, Printer, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { Client, Company, Invoice } from "@/lib/data/types";

/** Charge react-pdf et le gabarit à la demande (hors du bundle de la page). */
async function buildBlob(
  invoice: Invoice,
  company: Company,
  client?: Client,
): Promise<Blob> {
  const [{ pdf }, { InvoiceDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/pdf/invoice-document"),
  ]);
  return pdf(
    <InvoiceDocument invoice={invoice} company={company} client={client} />,
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
      const blob = await buildBlob(invoice, company, client);
      fn(blob);
    } catch (e) {
      console.error(e);
      toast({ variant: "error", title: "Génération du PDF impossible" });
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
      toast({ variant: "error", title: "Adresse email invalide" });
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
          title: "Envoi impossible",
          description: data.error ?? "Réessayez plus tard.",
        });
      } else {
        toast({
          variant: "success",
          title: "Facture envoyée",
          description: `${invoice.number} → ${sendTo.trim()}`,
        });
        setSendOpen(false);
        setSendMsg("");
      }
    } catch {
      toast({ variant: "error", title: "Envoi impossible" });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handlePreview} loading={busy === "preview"}>
        <Eye className="h-4 w-4" />
        Prévisualiser
      </Button>
      <Button variant="outline" onClick={handleDownload} loading={busy === "download"}>
        <Download className="h-4 w-4" />
        Télécharger PDF
      </Button>
      <Button variant="outline" onClick={handlePrint} loading={busy === "print"}>
        <Printer className="h-4 w-4" />
        Imprimer
      </Button>
      <Button variant="outline" onClick={() => setSendOpen(true)}>
        <Send className="h-4 w-4" />
        Envoyer
      </Button>

      <Modal
        open={previewOpen}
        onClose={closePreview}
        title={`Aperçu — ${invoice.number}`}
        size="xl"
      >
        {previewUrl && (
          <iframe
            title={`Aperçu de la facture ${invoice.number}`}
            src={previewUrl}
            className="h-[70vh] w-full rounded-xl border border-slate-200"
          />
        )}
      </Modal>

      <Modal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        title="Envoyer la facture par email"
        description={`La facture ${invoice.number} sera jointe en PDF.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setSendOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSend} loading={sending}>
              Envoyer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Destinataire"
            type="email"
            value={sendTo}
            onChange={(e) => setSendTo(e.target.value)}
            placeholder="client@exemple.com"
          />
          <Textarea
            label="Message (optionnel)"
            value={sendMsg}
            onChange={(e) => setSendMsg(e.target.value)}
            placeholder="Bonjour, veuillez trouver ci-joint votre facture…"
          />
        </div>
      </Modal>
    </>
  );
}
