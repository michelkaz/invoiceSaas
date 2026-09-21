import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { getServerT } from "@/lib/i18n/server";

export default function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const t = getServerT();
  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/invoices/${params.id}`}
        backLabel={t("invoiceForm.editBackLabel")}
        title={t("invoiceForm.editTitle")}
        description={t("invoiceForm.editDesc")}
      />
      <Suspense fallback={null}>
        <InvoiceForm mode="edit" invoiceId={params.id} />
      </Suspense>
    </div>
  );
}
