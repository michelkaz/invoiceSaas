import type { Invoice } from "@/lib/data/types";
import { formatFCFA } from "@/lib/money";
import { formatDate } from "@/lib/format";

interface InvoiceEmailParams {
  invoice: Invoice;
  companyName: string;
  message?: string;
}

/** Email HTML au branding Facturi accompagnant l'envoi d'une facture. */
export function invoiceEmailHtml({
  invoice,
  companyName,
  message,
}: InvoiceEmailParams): string {
  const intro = message
    ? escapeHtml(message).replace(/\n/g, "<br>")
    : `Veuillez trouver ci-joint la facture <strong>${invoice.number}</strong>.`;

  return `<div style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
    <div style="padding:20px 28px;border-bottom:1px solid #f1f5f9">
      <span style="display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;background:#7c3aed;color:#fff;border-radius:8px;font-weight:700;vertical-align:middle">F</span>
      <span style="font-size:15px;font-weight:700;margin-left:8px;vertical-align:middle">${escapeHtml(companyName || "Facturi")}</span>
    </div>
    <div style="padding:28px">
      <h1 style="margin:0 0 12px;font-size:17px;font-weight:700">Facture ${escapeHtml(invoice.number)}</h1>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569">${intro}</p>
      <table style="width:100%;font-size:13px;color:#475569;border-collapse:collapse">
        <tr><td style="padding:4px 0">Montant total</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#0f172a">${formatFCFA(invoice.total)}</td></tr>
        <tr><td style="padding:4px 0">Date d'émission</td><td style="padding:4px 0;text-align:right">${formatDate(invoice.issueDate)}</td></tr>
        <tr><td style="padding:4px 0">Échéance</td><td style="padding:4px 0;text-align:right">${formatDate(invoice.dueDate)}</td></tr>
      </table>
      <p style="margin:22px 0 0;font-size:12px;color:#94a3b8">Le détail complet figure dans le PDF joint à cet email.</p>
    </div>
  </div>
  <p style="max-width:520px;margin:16px auto 0;font-size:11px;color:#94a3b8;text-align:center">Envoyé avec Facturi</p>
</div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
