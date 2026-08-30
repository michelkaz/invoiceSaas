import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rowToClient, rowToCompany, rowToInvoice } from "@/lib/data/serialize";
import { sendInvoiceEmail } from "@/lib/email/send";
import { getServerLocale } from "@/lib/i18n/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    to?: string;
    message?: string;
  };
  const to = (body.to ?? "").trim();
  if (!EMAIL_RE.test(to)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  // RLS garantit que l'utilisateur ne peut lire que ses propres factures.
  const { data: invoiceRow } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!invoiceRow) {
    return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
  }

  const [{ data: companyRow }, { data: clientRow }] = await Promise.all([
    supabase.from("companies").select("*").eq("owner_id", user.id).maybeSingle(),
    supabase.from("clients").select("*").eq("id", invoiceRow.client_id).maybeSingle(),
  ]);

  const invoice = rowToInvoice(invoiceRow);
  const company = companyRow ? rowToCompany(companyRow) : null;
  const client = clientRow ? rowToClient(clientRow) : undefined;

  if (!company) {
    return NextResponse.json({ error: "Entreprise introuvable." }, { status: 400 });
  }

  const locale = getServerLocale();

  // Génération du PDF côté serveur.
  let pdf: Buffer;
  try {
    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { InvoiceDocument } = await import("@/lib/pdf/invoice-document");
    pdf = await renderToBuffer(
      InvoiceDocument({ invoice, company, client, locale }),
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Génération du PDF impossible." },
      { status: 500 },
    );
  }

  const result = await sendInvoiceEmail({
    to,
    message: body.message,
    invoice,
    companyName: company.name,
    pdf,
    locale,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
