"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/components/providers/data-provider";
import { useToast } from "@/components/ui/toast";
import type { Client } from "@/lib/data/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY = { name: "", email: "", phone: "", address: "" };

export function ClientFormModal({
  open,
  onClose,
  client,
}: {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
}) {
  const { addClient, updateClient } = useData();
  const { toast } = useToast();
  const isEdit = Boolean(client);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setValues(
      client
        ? {
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
          }
        : EMPTY,
    );
    setErrors({});
  }, [open, client]);

  const set = (key: keyof typeof EMPTY, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = () => {
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = "Le nom est requis.";
    if (!values.email.trim()) next.email = "L'email est requis.";
    else if (!EMAIL_RE.test(values.email.trim())) next.email = "Email invalide.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
    };

    if (isEdit && client) {
      updateClient(client.id, payload);
      toast({ variant: "success", title: "Client modifié", description: payload.name });
    } else {
      addClient(payload);
      toast({ variant: "success", title: "Client ajouté", description: payload.name });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier le client" : "Ajouter un client"}
      description={
        isEdit
          ? "Mettez à jour les coordonnées du client."
          : "Renseignez les coordonnées du nouveau client."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            {isEdit ? "Enregistrer" : "Ajouter le client"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Nom"
          required
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
          placeholder="Nom du client ou de l'entreprise"
        />
        <Input
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
          placeholder="contact@exemple.com"
        />
        <Input
          label="Téléphone"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+221 77 000 00 00"
        />
        <Textarea
          label="Adresse"
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Rue, ville, pays"
        />
      </div>
    </Modal>
  );
}
