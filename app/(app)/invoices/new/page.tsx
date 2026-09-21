import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { getServerT } from "@/lib/i18n/server";

export default function NewInvoicePage() {
  const t = getServerT();
  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/invoices"
        backLabel={t("invoices.allInvoices")}
        title={t("invoiceForm.createTitle")}
        description={t("invoiceForm.createDesc")}
      />
      <Suspense fallback={null}>
        <InvoiceForm mode="create" />
      </Suspense>
    </div>
  );
}
