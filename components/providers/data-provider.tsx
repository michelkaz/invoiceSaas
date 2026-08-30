"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  clients as seedClients,
  company as seedCompany,
  invoices as seedInvoices,
} from "@/lib/data/mock";
import { computeInvoiceTotals } from "@/lib/invoice-calc";
import {
  clientToRow,
  companyToRow,
  invoiceItemsToRows,
  invoiceToPayload,
  invoiceToRow,
  rowToClient,
  rowToCompany,
  rowToInvoice,
} from "@/lib/data/serialize";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/providers/i18n-provider";
import type {
  Client,
  Company,
  Invoice,
  InvoiceStatus,
} from "@/lib/data/types";

export interface InvoiceLineInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceInput {
  clientId: string;
  issueDate: string;
  dueDate: string;
  tvaRate: number;
  notes?: string;
  items: InvoiceLineInput[];
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  avatarUrl?: string;
}

interface DataState {
  clients: Client[];
  invoices: Invoice[];
  company: Company;
  onboardingCompleted: boolean;
  tutorialSeen: boolean;
}

interface DataContextValue extends DataState {
  hydrated: boolean;
  user: SessionUser | null;
  getClient: (id: string) => Client | undefined;
  getInvoice: (id: string) => Invoice | undefined;
  invoiceCountForClient: (clientId: string) => number;
  addClient: (data: Omit<Client, "id" | "createdAt">) => Client;
  updateClient: (id: string, data: Omit<Client, "id" | "createdAt">) => void;
  deleteClient: (id: string) => void;
  nextInvoiceNumber: () => string;
  addInvoice: (input: InvoiceInput, status: InvoiceStatus) => Invoice;
  updateInvoice: (id: string, input: InvoiceInput) => void;
  deleteInvoice: (id: string) => void;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  updateCompany: (data: Company) => void;
  completeOnboarding: () => void;
  setTutorialSeen: (seen: boolean) => void;
  loadDemoData: () => Promise<void>;
  /** Alias historique de loadDemoData (Paramètres → « Réinitialiser les données de démo »). */
  resetDemoData: () => void;
  deleteAccount: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function toSessionUser(u: User): SessionUser {
  const email = u.email ?? "";
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    (email ? email.split("@")[0] : "Utilisateur");
  return {
    id: u.id,
    email,
    name,
    emailVerified: Boolean(u.email_confirmed_at),
    avatarUrl:
      typeof meta.avatar_url === "string" ? meta.avatar_url : undefined,
  };
}

function computeNextNumber(invoices: Invoice[], company: Company): string {
  const year = new Date().getFullYear();
  const prefix = `${company.invoicePrefix}-${year}-`;
  const maxSeq = invoices
    .map((i) => i.number)
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.slice(prefix.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => Math.max(max, n), 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

/** Détecte une session Supabase expirée / invalide. */
function isAuthError(err: unknown): boolean {
  const e = err as { status?: number; code?: string; message?: string } | null;
  if (!e) return false;
  if (e.status === 401) return true;
  const m = `${e.code ?? ""} ${e.message ?? ""}`.toLowerCase();
  return m.includes("jwt") || m.includes("token") || m.includes("session");
}

const EMPTY_STATE: DataState = {
  clients: [],
  invoices: [],
  company: seedCompany,
  onboardingCompleted: false,
  tutorialSeen: false,
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const t = useT();

  const [state, setState] = useState<DataState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  const stateRef = useRef(state);
  const userRef = useRef<SessionUser | null>(null);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const handleAuthLoss = useCallback(() => {
    toast({
      variant: "error",
      title: t("errors.sessionExpired"),
      description: t("errors.sessionExpiredDesc"),
    });
    window.location.assign("/login?next=" + encodeURIComponent(window.location.pathname));
  }, [toast, t]);

  // ── Lecture complète depuis Supabase ──────────────────────────────────────
  const fetchAll = useCallback(
    async (uid: string): Promise<DataState> => {
      const [companyRes, clientsRes, invoicesRes] = await Promise.all([
        supabase.from("companies").select("*").eq("owner_id", uid).maybeSingle(),
        supabase
          .from("clients")
          .select("*")
          .eq("owner_id", uid)
          .order("created_at", { ascending: false }),
        supabase
          .from("invoices")
          .select("*, invoice_items(*)")
          .eq("owner_id", uid)
          .order("issue_date", { ascending: false }),
      ]);
      for (const res of [companyRes, clientsRes, invoicesRes]) {
        if (res.error && isAuthError(res.error)) {
          handleAuthLoss();
          break;
        }
      }
      const companyRow = companyRes.data;
      return {
        company: companyRow ? rowToCompany(companyRow) : seedCompany,
        clients: (clientsRes.data ?? []).map(rowToClient),
        invoices: (invoicesRes.data ?? []).map(rowToInvoice),
        onboardingCompleted: Boolean(companyRow?.onboarding_completed),
        tutorialSeen: Boolean(companyRow?.tutorial_seen),
      };
    },
    [supabase, handleAuthLoss],
  );

  const refetch = useCallback(async () => {
    const uid = userRef.current?.id;
    if (!uid) return;
    try {
      setState(await fetchAll(uid));
    } catch {
      /* réseau indisponible : on garde l'état courant */
    }
  }, [fetchAll]);

  const fail = useCallback(
    (title: string, err?: unknown) => {
      if (err) console.error(err);
      if (isAuthError(err)) {
        handleAuthLoss();
        return;
      }
      toast({
        variant: "error",
        title: t(title),
        description: t("errors.mutationFailed"),
      });
      void refetch();
    },
    [toast, refetch, handleAuthLoss, t],
  );

  const persist = useCallback(
    async (op: PromiseLike<{ error: unknown }>, title: string) => {
      try {
        const { error } = await op;
        if (error) fail(title, error);
      } catch (e) {
        fail(title, e);
      }
    },
    [fail],
  );

  // ── Amorçage : session + première lecture (pas de seed automatique) ───────
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!authUser) {
        setHydrated(true);
        return;
      }

      setUser(toSessionUser(authUser));
      const next = await fetchAll(authUser.id);
      if (cancelled) return;
      setState(next);
      setHydrated(true);
    }

    void boot();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        setState(EMPTY_STATE);
        setHydrated(true);
        return;
      }
      const su = toSessionUser(session.user);
      const prev = userRef.current;
      if (su.id !== prev?.id) {
        setUser(su);
        fetchAll(su.id)
          .then((d) => {
            if (!cancelled) setState(d);
          })
          .catch(() => {});
      } else if (
        su.emailVerified !== prev?.emailVerified ||
        su.avatarUrl !== prev?.avatarUrl ||
        su.name !== prev?.name
      ) {
        // ex. USER_UPDATED après changement de photo de profil
        setUser(su);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase, fetchAll]);

  // ── Lectures synchrones ──────────────────────────────────────────────────
  const getClient = useCallback(
    (id: string) => stateRef.current.clients.find((c) => c.id === id),
    [],
  );
  const getInvoice = useCallback(
    (id: string) => stateRef.current.invoices.find((i) => i.id === id),
    [],
  );
  const invoiceCountForClient = useCallback(
    (clientId: string) =>
      stateRef.current.invoices.filter((i) => i.clientId === clientId).length,
    [],
  );

  // ── Mutations optimistes + write-through Supabase ────────────────────────
  const addClient = useCallback(
    (data: Omit<Client, "id" | "createdAt">) => {
      const client: Client = {
        ...data,
        id: genId(),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setState((prev) => ({ ...prev, clients: [client, ...prev.clients] }));
      const uid = userRef.current?.id;
      if (uid) {
        void persist(
          supabase.from("clients").insert({
            id: client.id,
            owner_id: uid,
            ...clientToRow(data),
            created_at: client.createdAt,
          }),
          "errors.addClientFailed",
        );
      }
      return client;
    },
    [supabase, persist],
  );

  const updateClient = useCallback(
    (id: string, data: Omit<Client, "id" | "createdAt">) => {
      setState((prev) => ({
        ...prev,
        clients: prev.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }));
      void persist(
        supabase.from("clients").update(clientToRow(data)).eq("id", id),
        "errors.updateClientFailed",
      );
    },
    [supabase, persist],
  );

  const deleteClient = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        clients: prev.clients.filter((c) => c.id !== id),
      }));
      void persist(
        supabase.from("clients").delete().eq("id", id),
        "errors.deleteClientFailed",
      );
    },
    [supabase, persist],
  );

  const nextInvoiceNumber = useCallback(
    () => computeNextNumber(stateRef.current.invoices, stateRef.current.company),
    [],
  );

  const buildInvoice = useCallback(
    (input: InvoiceInput, status: InvoiceStatus, base?: Invoice): Invoice => {
      const totals = computeInvoiceTotals(input.items, input.tvaRate);
      return {
        id: base?.id ?? genId(),
        number:
          base?.number ??
          computeNextNumber(stateRef.current.invoices, stateRef.current.company),
        clientId: input.clientId,
        status,
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        currency: stateRef.current.company.currency,
        tvaRate: input.tvaRate,
        items: input.items.map((item) => ({ ...item, id: genId() })),
        notes: input.notes?.trim() ? input.notes.trim() : undefined,
        ...totals,
      };
    },
    [],
  );

  const addInvoice = useCallback(
    (input: InvoiceInput, status: InvoiceStatus) => {
      const invoice = buildInvoice(input, status);
      setState((prev) => ({ ...prev, invoices: [invoice, ...prev.invoices] }));
      void persist(
        supabase.rpc("create_invoice", invoiceToPayload(invoice)),
        "errors.createInvoiceFailed",
      );
      return invoice;
    },
    [supabase, persist, buildInvoice],
  );

  const updateInvoice = useCallback(
    (id: string, input: InvoiceInput) => {
      const base = stateRef.current.invoices.find((i) => i.id === id);
      if (!base) return;
      const updated = buildInvoice(input, base.status, base);
      setState((prev) => ({
        ...prev,
        invoices: prev.invoices.map((inv) => (inv.id === id ? updated : inv)),
      }));
      void persist(
        supabase.rpc("update_invoice", invoiceToPayload(updated)),
        "errors.updateInvoiceFailed",
      );
    },
    [supabase, persist, buildInvoice],
  );

  const deleteInvoice = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        invoices: prev.invoices.filter((i) => i.id !== id),
      }));
      void persist(
        supabase.from("invoices").delete().eq("id", id),
        "errors.deleteInvoiceFailed",
      );
    },
    [supabase, persist],
  );

  const setInvoiceStatus = useCallback(
    (id: string, status: InvoiceStatus) => {
      setState((prev) => ({
        ...prev,
        invoices: prev.invoices.map((inv) =>
          inv.id === id ? { ...inv, status } : inv,
        ),
      }));
      void persist(
        supabase.from("invoices").update({ status }).eq("id", id),
        "errors.statusFailed",
      );
    },
    [supabase, persist],
  );

  const updateCompany = useCallback(
    (data: Company) => {
      setState((prev) => ({ ...prev, company: data }));
      const uid = userRef.current?.id;
      if (uid) {
        void persist(
          supabase.from("companies").update(companyToRow(data)).eq("owner_id", uid),
          "errors.settingsFailed",
        );
      }
    },
    [supabase, persist],
  );

  const completeOnboarding = useCallback(() => {
    setState((prev) => ({ ...prev, onboardingCompleted: true }));
    const uid = userRef.current?.id;
    if (uid) {
      void persist(
        supabase
          .from("companies")
          .update({ onboarding_completed: true })
          .eq("owner_id", uid),
        "errors.saveFailed",
      );
    }
  }, [supabase, persist]);

  const setTutorialSeen = useCallback(
    (seen: boolean) => {
      setState((prev) => ({ ...prev, tutorialSeen: seen }));
      const uid = userRef.current?.id;
      if (uid) {
        void persist(
          supabase
            .from("companies")
            .update({ tutorial_seen: seen })
            .eq("owner_id", uid),
          "errors.saveFailed",
        );
      }
    },
    [supabase, persist],
  );

  const loadDemoData = useCallback(async () => {
    const uid = userRef.current?.id;
    if (!uid) return;
    try {
      await supabase.from("invoices").delete().eq("owner_id", uid);
      await supabase.from("clients").delete().eq("owner_id", uid);
      await supabase
        .from("companies")
        .update({ ...companyToRow(seedCompany), onboarding_completed: true })
        .eq("owner_id", uid);
      await supabase.from("clients").insert(
        seedClients.map((c) => ({
          id: c.id,
          owner_id: uid,
          name: c.name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          created_at: c.createdAt,
        })),
      );
      await supabase
        .from("invoices")
        .insert(seedInvoices.map((inv) => invoiceToRow(inv, uid)));
      await supabase
        .from("invoice_items")
        .insert(seedInvoices.flatMap(invoiceItemsToRows));
      setState(await fetchAll(uid));
    } catch (e) {
      fail("errors.demoLoadFailed", e);
    }
  }, [supabase, fetchAll, fail]);

  const resetDemoData = useCallback(() => {
    void loadDemoData();
  }, [loadDemoData]);

  const deleteAccount = useCallback(async () => {
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      fail("errors.deleteAccountFailed", error);
      return;
    }
    await supabase.auth.signOut();
    window.location.assign("/login");
  }, [supabase, fail]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.assign("/login");
  }, [supabase]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo<DataContextValue>(
    () => ({
      ...state,
      hydrated,
      user,
      getClient,
      getInvoice,
      invoiceCountForClient,
      addClient,
      updateClient,
      deleteClient,
      nextInvoiceNumber,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      setInvoiceStatus,
      updateCompany,
      completeOnboarding,
      setTutorialSeen,
      loadDemoData,
      resetDemoData,
      deleteAccount,
      signOut,
      refresh,
    }),
    [
      state,
      hydrated,
      user,
      getClient,
      getInvoice,
      invoiceCountForClient,
      addClient,
      updateClient,
      deleteClient,
      nextInvoiceNumber,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      setInvoiceStatus,
      updateCompany,
      completeOnboarding,
      setTutorialSeen,
      loadDemoData,
      resetDemoData,
      deleteAccount,
      signOut,
      refresh,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData doit être utilisé dans <DataProvider>");
  return ctx;
}
