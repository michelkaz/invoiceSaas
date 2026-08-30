import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Client, Company, Invoice } from "@/lib/data/types";
import { formatFCFA } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { lineTotal } from "@/lib/invoice-calc";
import { STATUS_LABEL } from "@/lib/invoice-status";

const BRAND = "#7c3aed";
const BRAND_DARK = "#5b21b6";
const BRAND_TINT = "#f5f3ff";
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";
const PANEL = "#f8fafc";

const s = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 56,
    paddingHorizontal: 0,
    fontSize: 9,
    color: INK,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  accent: { height: 6, backgroundColor: BRAND },
  body: { paddingHorizontal: 44, paddingTop: 32 },

  header: { flexDirection: "row", justifyContent: "space-between" },
  logo: { height: 40, marginBottom: 8, objectFit: "contain" },
  companyName: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  muted: { color: MUTED },

  metaBox: {
    width: 190,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    backgroundColor: PANEL,
    padding: 12,
  },
  metaLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: BRAND,
    fontFamily: "Helvetica-Bold",
  },
  metaNumber: { fontSize: 14, fontFamily: "Helvetica-Bold", marginTop: 2 },
  metaStatus: {
    marginTop: 6,
    color: BRAND_DARK,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
  },
  metaDivider: { borderTopWidth: 1, borderColor: LINE, marginTop: 8, paddingTop: 6 },

  section: { marginTop: 26 },
  blockLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: MUTED,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  strong: { fontFamily: "Helvetica-Bold", fontSize: 10 },

  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: INK,
    paddingBottom: 5,
    marginTop: 24,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: LINE,
    paddingVertical: 6,
  },
  cDesc: { flex: 1, paddingRight: 8 },
  cQty: { width: 44, textAlign: "right" },
  cUnit: { width: 90, textAlign: "right" },
  cTotal: { width: 90, textAlign: "right" },
  th: { fontFamily: "Helvetica-Bold", fontSize: 8, color: MUTED },

  totals: { marginTop: 16, marginLeft: "auto", width: 230 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grandBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: BRAND_TINT,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  grandLabel: { fontFamily: "Helvetica-Bold", fontSize: 10, color: BRAND_DARK },
  grandValue: { fontFamily: "Helvetica-Bold", fontSize: 12, color: BRAND },

  notes: { marginTop: 26, paddingTop: 12, borderTopWidth: 1, borderColor: LINE },

  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    fontSize: 8,
    color: MUTED,
    borderTopWidth: 1,
    borderColor: LINE,
    paddingTop: 8,
  },
});

export function InvoiceDocument({
  invoice,
  company,
  client,
}: {
  invoice: Invoice;
  company: Company;
  client?: Client;
}) {
  const legal = [
    company.rccm && `RCCM : ${company.rccm}`,
    company.nif && `NIF : ${company.nif}`,
    company.idNat && `ID NAT : ${company.idNat}`,
  ]
    .filter(Boolean)
    .join("   ·   ");

  return (
    <Document
      title={`Facture ${invoice.number}`}
      author={company.name || "Facturi"}
    >
      <Page size="A4" style={s.page}>
        <View style={s.accent} fixed />

        <View style={s.body}>
          <View style={s.header}>
            <View style={{ maxWidth: 260 }}>
              {company.logoUrl ? (
                // react-pdf <Image> n'est pas un <img> HTML (pas de prop alt)
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={company.logoUrl} style={s.logo} />
              ) : null}
              <Text style={s.companyName}>
                {company.name || "Votre entreprise"}
              </Text>
              {company.legalName ? (
                <Text style={s.muted}>{company.legalName}</Text>
              ) : null}
              {company.address ? (
                <Text style={s.muted}>{company.address}</Text>
              ) : null}
              <Text style={s.muted}>
                {[company.city, company.country].filter(Boolean).join(", ")}
              </Text>
              {company.phone ? (
                <Text style={s.muted}>{company.phone}</Text>
              ) : null}
              {company.email ? (
                <Text style={s.muted}>{company.email}</Text>
              ) : null}
            </View>

            <View style={s.metaBox}>
              <Text style={s.metaLabel}>FACTURE</Text>
              <Text style={s.metaNumber}>{invoice.number}</Text>
              <Text style={s.metaStatus}>{STATUS_LABEL[invoice.status]}</Text>
              <View style={s.metaDivider}>
                <View style={s.metaRow}>
                  <Text style={s.muted}>Émission</Text>
                  <Text>{formatDate(invoice.issueDate)}</Text>
                </View>
                <View style={s.metaRow}>
                  <Text style={s.muted}>Échéance</Text>
                  <Text>{formatDate(invoice.dueDate)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.blockLabel}>FACTURÉ À</Text>
            <Text style={s.strong}>{client?.name ?? "Client supprimé"}</Text>
            {client?.address ? (
              <Text style={s.muted}>{client.address}</Text>
            ) : null}
            {client?.phone ? <Text style={s.muted}>{client.phone}</Text> : null}
            {client?.email ? <Text style={s.muted}>{client.email}</Text> : null}
          </View>

          <View style={s.tableHead}>
            <Text style={[s.cDesc, s.th]}>Description</Text>
            <Text style={[s.cQty, s.th]}>Qté</Text>
            <Text style={[s.cUnit, s.th]}>Prix unitaire</Text>
            <Text style={[s.cTotal, s.th]}>Total</Text>
          </View>
          {invoice.items.map((it) => (
            <View style={s.row} key={it.id} wrap={false}>
              <Text style={s.cDesc}>{it.description}</Text>
              <Text style={s.cQty}>{it.quantity}</Text>
              <Text style={s.cUnit}>{formatFCFA(it.unitPrice)}</Text>
              <Text style={s.cTotal}>
                {formatFCFA(lineTotal(it.quantity, it.unitPrice))}
              </Text>
            </View>
          ))}

          <View style={s.totals}>
            <View style={s.totalRow}>
              <Text style={s.muted}>Sous-total</Text>
              <Text>{formatFCFA(invoice.subtotal)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.muted}>TVA ({invoice.tvaRate} %)</Text>
              <Text>{formatFCFA(invoice.tvaAmount)}</Text>
            </View>
            <View style={s.grandBox}>
              <Text style={s.grandLabel}>Total TTC</Text>
              <Text style={s.grandValue}>{formatFCFA(invoice.total)}</Text>
            </View>
          </View>

          {invoice.notes ? (
            <View style={s.notes}>
              <Text style={s.blockLabel}>NOTES</Text>
              <Text style={s.muted}>{invoice.notes}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.footer} fixed>
          {legal ? <Text>{legal}</Text> : null}
          {company.bankDetails ? (
            <Text style={{ marginTop: 2 }}>
              Règlement par virement — {company.bankDetails}
            </Text>
          ) : null}
          {company.paymentTermsDays ? (
            <Text style={{ marginTop: 2 }}>
              Conditions de paiement : {company.paymentTermsDays} jours à réception.
            </Text>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
