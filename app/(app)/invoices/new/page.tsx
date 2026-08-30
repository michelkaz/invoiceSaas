import { PageHeader } from "@/components/ui/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/invoices"
        backLabel="Factures"
        title="Nouvelle facture"
        description="Renseignez le client, les lignes et la TVA. Le total est calculé automatiquement."
      />
      <InvoiceForm mode="create" />
    </div>
  );
}
