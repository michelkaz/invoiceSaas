"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Avatar } from "@/components/ui/avatar";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { useData } from "@/components/providers/data-provider";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/providers/i18n-provider";
import type { Client } from "@/lib/data/types";

export function ClientsView() {
  const { hydrated, clients, invoiceCountForClient, deleteClient } = useData();
  const { toast } = useToast();
  const t = useT();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [toDelete, setToDelete] = useState<Client | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...clients].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [clients, query]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (client: Client) => {
    setEditing(client);
    setFormOpen(true);
  };

  const askDelete = (client: Client) => {
    const count = invoiceCountForClient(client.id);
    if (count > 0) {
      toast({
        variant: "error",
        title: t("clients.deleteBlockedTitle"),
        description: t(
          count > 1 ? "clients.deleteBlockedMany" : "clients.deleteBlockedOne",
          { name: client.name, count },
        ),
      });
      return;
    }
    setToDelete(client);
  };

  if (!hydrated) return <ListSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("clients.title")}
        description={t(
          clients.length > 1 ? "clients.countMany" : "clients.countOne",
          { count: clients.length },
        )}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {t("clients.add")}
          </Button>
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t("clients.search")}
            className="sm:w-80"
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              query
                ? t("clients.emptyFilteredTitle")
                : t("clients.emptyTitle")
            }
            description={
              query
                ? t("clients.emptyFilteredDesc")
                : t("clients.emptyDesc")
            }
            action={
              !query ? (
                <Button onClick={openAdd}>
                  <Plus className="h-4 w-4" />
                  {t("clients.add")}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table minWidth={760}>
            <THead>
              <TH>{t("clients.colClient")}</TH>
              <TH>{t("clients.colEmail")}</TH>
              <TH>{t("clients.colPhone")}</TH>
              <TH>{t("clients.colAddress")}</TH>
              <TH className="text-right">{t("clients.colInvoices")}</TH>
              <TH />
            </THead>
            <TBody>
              {rows.map((client) => (
                <TR key={client.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar name={client.name} size="sm" />
                      <span className="font-medium text-slate-900">
                        {client.name}
                      </span>
                    </div>
                  </TD>
                  <TD className="text-slate-600">{client.email}</TD>
                  <TD className="tabular-nums text-slate-600">
                    {client.phone || "—"}
                  </TD>
                  <TD className="max-w-[220px] truncate text-slate-600">
                    {client.address || "—"}
                  </TD>
                  <TD className="text-right tabular-nums text-slate-600">
                    {invoiceCountForClient(client.id)}
                  </TD>
                  <TD className="text-right">
                    <DropdownMenu
                      items={[
                        {
                          label: t("clients.edit"),
                          icon: Pencil,
                          onClick: () => openEdit(client),
                        },
                        {
                          label: t("clients.delete"),
                          icon: Trash2,
                          danger: true,
                          separatorBefore: true,
                          onClick: () => askDelete(client),
                        },
                      ]}
                    />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <ClientFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        client={editing}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteClient(toDelete.id);
            toast({
              variant: "success",
              title: t("clients.deleted"),
              description: toDelete.name,
            });
          }
          setToDelete(null);
        }}
        title={t("clients.confirmDeleteTitle")}
        message={t("clients.confirmDeleteMsg", { name: toDelete?.name ?? "" })}
        confirmLabel={t("common.delete")}
      />
    </div>
  );
}
