"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/components/providers/data-provider";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/providers/i18n-provider";
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
  const t = useT();
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
    if (!values.name.trim()) next.name = t("clients.nameRequired");
    if (!values.email.trim()) next.email = t("clients.emailRequired");
    else if (!EMAIL_RE.test(values.email.trim())) next.email = t("clients.emailInvalid");
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
      toast({ variant: "success", title: t("clients.clientUpdated"), description: payload.name });
    } else {
      addClient(payload);
      toast({ variant: "success", title: t("clients.clientAdded"), description: payload.name });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("clients.modalEditTitle") : t("clients.modalAddTitle")}
      description={
        isEdit ? t("clients.modalEditDesc") : t("clients.modalAddDesc")
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit}>
            {isEdit ? t("clients.save") : t("clients.addClient")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label={t("clients.name")}
          required
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
          placeholder={t("clients.namePlaceholder")}
        />
        <Input
          label={t("clients.email")}
          type="email"
          required
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
          placeholder={t("clients.emailPlaceholder")}
        />
        <Input
          label={t("clients.phone")}
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder={t("clients.phonePlaceholder")}
        />
        <Textarea
          label={t("clients.address")}
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </div>
    </Modal>
  );
}
