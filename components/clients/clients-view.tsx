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
import type { Client } from "@/lib/data/types";

export function ClientsView() {
  const { hydrated, clients, invoiceCountForClient, deleteClient } = useData();
  const { toast } = useToast();

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
        title: "Suppression impossible",
        description: `${client.name} a ${count} facture${count > 1 ? "s" : ""} liée${count > 1 ? "s" : ""}.`,
      });
      return;
    }
    setToDelete(client);
  };

  if (!hydrated) return <ListSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description={`${clients.length} client${clients.length > 1 ? "s" : ""}`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Ajouter un client
          </Button>
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Rechercher par nom ou email…"
            className="sm:w-80"
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              !hydrated
                ? "Chargement…"
                : query
                  ? "Aucun client ne correspond"
                  : "Aucun client pour l'instant"
            }
            description={
              query
                ? "Essayez une autre recherche."
                : "Ajoutez un client pour commencer à facturer."
            }
            action={
              !query ? (
                <Button onClick={openAdd}>
                  <Plus className="h-4 w-4" />
                  Ajouter un client
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table minWidth={760}>
            <THead>
              <TH>Client</TH>
              <TH>Email</TH>
              <TH>Téléphone</TH>
              <TH>Adresse</TH>
              <TH className="text-right">Factures</TH>
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
                          label: "Modifier",
                          icon: Pencil,
                          onClick: () => openEdit(client),
                        },
                        {
                          label: "Supprimer",
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
              title: "Client supprimé",
              description: toDelete.name,
            });
          }
          setToDelete(null);
        }}
        title="Supprimer le client"
        message={
          <>
            <strong>{toDelete?.name}</strong> sera définitivement supprimé.
          </>
        }
        confirmLabel="Supprimer"
      />
    </div>
  );
}
