import {
  Document,
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
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";

const s = StyleSheet.create({
  page: {
    paddingVertical: 40,
    paddingHorizontal: 44,
    fontSize: 9,
    color: INK,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  header: { flexDirection: "row", justifyContent: "space-between" },
  companyName: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  muted: { color: MUTED },
  right: { textAlign: "right" },
  docLabel: {
    fontSize: 8,
    letterSpacing: 1,
    color: MUTED,
    fontFamily: "Helvetica-Bold",
  },
  docNumber: { fontSize: 15, fontFamily: "Helvetica-Bold", marginTop: 2 },
  statusPill: {
    marginTop: 4,
    alignSelf: "flex-end",
    color: BRAND,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  section: { marginTop: 26 },
  blockLabel: {
    fontSize: 8,
    letterSpacing: 1,
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
  totals: { marginTop: 14, marginLeft: "auto", width: 220 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: LINE,
  },
  grand: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  notes: {
    marginTop: 26,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: LINE,
  },
  footer: {
    position: "absolute",
    bottom: 30,
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
  return (
    <Document
      title={`Facture ${invoice.number}`}
      author={company.name || "Facturi"}
    >
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={{ maxWidth: 260 }}>
            <Text style={s.companyName}>{company.name || "Votre entreprise"}</Text>
            {company.legalName ? <Text style={s.muted}>{company.legalName}</Text> : null}
            {company.address ? <Text style={s.muted}>{company.address}</Text> : null}
            <Text style={s.muted}>
              {[company.city, company.country].filter(Boolean).join(", ")}
            </Text>
            {company.phone ? <Text style={s.muted}>{company.phone}</Text> : null}
            {company.email ? <Text style={s.muted}>{company.email}</Text> : null}
            {company.taxId ? (
              <Text style={s.muted}>NINEA / RCCM : {company.taxId}</Text>
            ) : null}
          </View>
          <View style={s.right}>
            <Text style={s.docLabel}>FACTURE</Text>
            <Text style={s.docNumber}>{invoice.number}</Text>
            <Text style={s.statusPill}>{STATUS_LABEL[invoice.status]}</Text>
            <Text style={[s.muted, { marginTop: 6 }]}>
              Émission : {formatDate(invoice.issueDate)}
            </Text>
            <Text style={s.muted}>Échéance : {formatDate(invoice.dueDate)}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.blockLabel}>FACTURÉ À</Text>
          <Text style={s.strong}>{client?.name ?? "Client supprimé"}</Text>
          {client?.address ? <Text style={s.muted}>{client.address}</Text> : null}
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
          <View style={s.grandRow}>
            <Text style={s.grand}>Total TTC</Text>
            <Text style={s.grand}>{formatFCFA(invoice.total)}</Text>
          </View>
        </View>

        {invoice.notes ? (
          <View style={s.notes}>
            <Text style={s.blockLabel}>NOTES</Text>
            <Text style={s.muted}>{invoice.notes}</Text>
          </View>
        ) : null}

        {company.paymentTermsDays ? (
          <View style={{ marginTop: 16 }}>
            <Text style={s.muted}>
              Conditions de paiement : {company.paymentTermsDays} jours à réception.
            </Text>
          </View>
        ) : null}

        {company.bankDetails ? (
          <Text style={s.footer}>
            Règlement par virement — {company.bankDetails}
          </Text>
        ) : null}
      </Page>
    </Document>
  );
}
