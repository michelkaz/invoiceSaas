import type { Invoice } from "@/lib/data/types";
import { invoiceEmailHtml } from "@/lib/email/templates";

export interface SendResult {
  ok: boolean;
  error?: string;
}

interface SendInvoiceParams {
  to: string;
  message?: string;
  invoice: Invoice;
  companyName: string;
  pdf: Buffer;
}

/**
 * Envoi transactionnel via Resend. Sans configuration (`RESEND_API_KEY` /
 * `EMAIL_FROM`), l'appel échoue proprement avec un message explicite.
 */
export async function sendInvoiceEmail(
  params: SendInvoiceParams,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return {
      ok: false,
      error:
        "L'envoi d'email n'est pas encore configuré (ajoutez RESEND_API_KEY et EMAIL_FROM).",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: `Facture ${params.invoice.number} — ${params.companyName || "Facturi"}`,
      html: invoiceEmailHtml({
        invoice: params.invoice,
        companyName: params.companyName,
        message: params.message,
      }),
      attachments: [
        {
          filename: `${params.invoice.number}.pdf`,
          content: params.pdf,
        },
      ],
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur d'envoi" };
  }
}
