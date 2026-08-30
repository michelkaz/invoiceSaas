import { PageHeader } from "@/components/ui/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/invoices/${params.id}`}
        backLabel="Retour à la facture"
        title="Modifier la facture"
        description="Les modifications sont enregistrées localement."
      />
      <InvoiceForm mode="edit" invoiceId={params.id} />
    </div>
  );
}
