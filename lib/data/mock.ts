import { computeInvoiceTotals } from "@/lib/invoice-calc";
import type {
  Client,
  Company,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  InvoiceWithClient,
} from "@/lib/data/types";

/**
 * Données fictives codées en dur (phase 1 — design).
 * Aucune base de données : tout est en mémoire.
 */

export const company: Company = {
  name: "Atelier Baobab",
  legalName: "Atelier Baobab SARL",
  address: "Rue 12, Point E",
  city: "Dakar",
  country: "Sénégal",
  phone: "+221 33 825 14 20",
  email: "contact@atelierbaobab.sn",
  taxId: "SN-DKR-2021-A-12345",
  currency: "XOF",
  defaultTvaRate: 18,
  invoicePrefix: "FAC",
  paymentTermsDays: 30,
  bankDetails: "CBAO Sénégal — IBAN SN08 SN01 0100 1234 5678 9012 34 — BIC CBAOSNDA",
};

export const currentUser = {
  firstName: "Awa",
  lastName: "Diallo",
  email: "awa@atelierbaobab.sn",
  role: "Fondatrice",
};

export const clients: Client[] = [
  {
    id: "cli_01",
    name: "Konaté & Fils",
    email: "compta@konatefils.ci",
    phone: "+225 07 08 09 10 11",
    address: "Boulevard Latrille, Cocody, Abidjan, Côte d'Ivoire",
    createdAt: "2025-11-04",
  },
  {
    id: "cli_02",
    name: "Boutique Chez Fatou",
    email: "fatou@chezfatou.bj",
    phone: "+229 97 00 11 22",
    address: "Quartier Ganhi, Cotonou, Bénin",
    createdAt: "2025-12-18",
  },
  {
    id: "cli_03",
    name: "AgroPlus SA",
    email: "finance@agroplus.sn",
    phone: "+221 33 889 10 20",
    address: "Zone industrielle, Thiès, Sénégal",
    createdAt: "2026-01-09",
  },
  {
    id: "cli_04",
    name: "Studio Mensah",
    email: "hello@studiomensah.tg",
    phone: "+228 90 55 66 77",
    address: "Avenue de la Libération, Lomé, Togo",
    createdAt: "2026-01-27",
  },
  {
    id: "cli_05",
    name: "Ouédraogo Logistics",
    email: "devis@ouedraogo-log.bf",
    phone: "+226 70 12 34 56",
    address: "Secteur 15, Ouagadougou, Burkina Faso",
    createdAt: "2026-02-14",
  },
  {
    id: "cli_06",
    name: "Nour Digital",
    email: "nour@nourdigital.ci",
    phone: "+225 05 44 55 66",
    address: "Rue des Jardins, Deux Plateaux, Abidjan, Côte d'Ivoire",
    createdAt: "2026-03-02",
  },
  {
    id: "cli_07",
    name: "Ibrahim Touré",
    email: "i.toure@example.ml",
    phone: "+223 66 22 33 44",
    address: "Hippodrome, Bamako, Mali",
    createdAt: "2026-04-11",
  },
  {
    id: "cli_08",
    name: "Coopérative Teranga",
    email: "bureau@teranga-coop.sn",
    phone: "+221 77 645 90 12",
    address: "Route de Rufisque, Dakar, Sénégal",
    createdAt: "2026-05-20",
  },
];

interface InvoiceSeed {
  id: string;
  number: string;
  clientId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: Array<Omit<InvoiceItem, "id">>;
  notes?: string;
}

const invoiceSeeds: InvoiceSeed[] = [
  {
    id: "inv_01",
    number: "FAC-2026-0014",
    clientId: "cli_08",
    status: "brouillon",
    issueDate: "2026-08-24",
    dueDate: "2026-09-23",
    items: [
      { description: "Identité visuelle — logo et charte", quantity: 1, unitPrice: 650_000 },
      { description: "Déclinaisons réseaux sociaux", quantity: 6, unitPrice: 35_000 },
    ],
  },
  {
    id: "inv_02",
    number: "FAC-2026-0013",
    clientId: "cli_06",
    status: "envoyee",
    issueDate: "2026-08-12",
    dueDate: "2026-09-11",
    items: [
      { description: "Refonte site vitrine (5 pages)", quantity: 1, unitPrice: 1_200_000 },
      { description: "Séance photo produits", quantity: 1, unitPrice: 180_000 },
      { description: "Hébergement annuel", quantity: 1, unitPrice: 90_000 },
    ],
  },
  {
    id: "inv_03",
    number: "FAC-2026-0012",
    clientId: "cli_03",
    status: "payee",
    issueDate: "2026-08-03",
    dueDate: "2026-09-02",
    items: [
      { description: "Campagne d'affichage — conception", quantity: 1, unitPrice: 420_000 },
      { description: "Impression bâches 3x2 m", quantity: 8, unitPrice: 45_000 },
    ],
  },
  {
    id: "inv_04",
    number: "FAC-2026-0011",
    clientId: "cli_01",
    status: "payee",
    issueDate: "2026-07-19",
    dueDate: "2026-08-18",
    items: [
      { description: "Catalogue produits 24 pages", quantity: 1, unitPrice: 780_000 },
      { description: "Retouches photo", quantity: 30, unitPrice: 6_000 },
    ],
  },
  {
    id: "inv_05",
    number: "FAC-2026-0010",
    clientId: "cli_05",
    status: "en_retard",
    issueDate: "2026-06-28",
    dueDate: "2026-07-28",
    items: [
      { description: "Habillage de flotte (4 véhicules)", quantity: 4, unitPrice: 260_000 },
      { description: "Pose sur site", quantity: 1, unitPrice: 120_000 },
    ],
  },
  {
    id: "inv_06",
    number: "FAC-2026-0009",
    clientId: "cli_02",
    status: "en_retard",
    issueDate: "2026-06-15",
    dueDate: "2026-07-15",
    items: [
      { description: "Enseigne lumineuse", quantity: 1, unitPrice: 540_000 },
      { description: "Cartes de visite (1000 ex.)", quantity: 1, unitPrice: 60_000 },
    ],
  },
  {
    id: "inv_07",
    number: "FAC-2026-0008",
    clientId: "cli_04",
    status: "payee",
    issueDate: "2026-06-04",
    dueDate: "2026-07-04",
    items: [
      { description: "Motion design — vidéo 45 s", quantity: 1, unitPrice: 950_000 },
    ],
  },
  {
    id: "inv_08",
    number: "FAC-2026-0007",
    clientId: "cli_07",
    status: "envoyee",
    issueDate: "2026-05-22",
    dueDate: "2026-06-21",
    items: [
      { description: "Accompagnement branding (forfait mensuel)", quantity: 2, unitPrice: 300_000 },
    ],
  },
  {
    id: "inv_09",
    number: "FAC-2026-0006",
    clientId: "cli_03",
    status: "payee",
    issueDate: "2026-05-08",
    dueDate: "2026-06-07",
    items: [
      { description: "Packaging gamme jus (3 références)", quantity: 3, unitPrice: 210_000 },
      { description: "Bon à tirer et suivi imprimeur", quantity: 1, unitPrice: 85_000 },
    ],
  },
  {
    id: "inv_10",
    number: "FAC-2026-0005",
    clientId: "cli_01",
    status: "payee",
    issueDate: "2026-04-17",
    dueDate: "2026-05-17",
    items: [
      { description: "Stand salon 6x3 m — conception", quantity: 1, unitPrice: 680_000 },
      { description: "Kakémonos", quantity: 4, unitPrice: 40_000 },
    ],
  },
  {
    id: "inv_11",
    number: "FAC-2026-0004",
    clientId: "cli_06",
    status: "payee",
    issueDate: "2026-03-28",
    dueDate: "2026-04-27",
    items: [
      { description: "Landing page campagne", quantity: 1, unitPrice: 480_000 },
      { description: "Intégration emailing", quantity: 1, unitPrice: 150_000 },
    ],
  },
  {
    id: "inv_12",
    number: "FAC-2026-0003",
    clientId: "cli_02",
    status: "payee",
    issueDate: "2026-02-20",
    dueDate: "2026-03-22",
    items: [
      { description: "Menu restaurant — design et impression", quantity: 1, unitPrice: 320_000 },
    ],
  },
  {
    id: "inv_13",
    number: "FAC-2026-0002",
    clientId: "cli_05",
    status: "payee",
    issueDate: "2026-01-30",
    dueDate: "2026-03-01",
    items: [
      { description: "Charte documentaire (modèles Word/PPT)", quantity: 1, unitPrice: 390_000 },
    ],
  },
  {
    id: "inv_14",
    number: "FAC-2026-0001",
    clientId: "cli_04",
    status: "payee",
    issueDate: "2026-01-12",
    dueDate: "2026-02-11",
    items: [
      { description: "Direction artistique — shooting mode", quantity: 1, unitPrice: 720_000 },
      { description: "Location studio (2 jours)", quantity: 2, unitPrice: 130_000 },
    ],
  },
];

export const invoices: Invoice[] = invoiceSeeds.map((seed) => {
  const items: InvoiceItem[] = seed.items.map((item, index) => ({
    ...item,
    id: `${seed.id}_it_${index + 1}`,
  }));
  const totals = computeInvoiceTotals(items, company.defaultTvaRate);
  return {
    id: seed.id,
    number: seed.number,
    clientId: seed.clientId,
    status: seed.status,
    issueDate: seed.issueDate,
    dueDate: seed.dueDate,
    currency: company.currency,
    tvaRate: company.defaultTvaRate,
    items,
    notes: seed.notes,
    ...totals,
  };
});

const clientsById = new Map(clients.map((c) => [c.id, c]));

export function getInvoicesWithClient(): InvoiceWithClient[] {
  return invoices
    .map((invoice) => ({
      ...invoice,
      client: clientsById.get(invoice.clientId),
    }))
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
}
