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
 * Jeu de démonstration — entreprise fictive basée à Kinshasa (RDC).
 * Montants en francs congolais (CDF). Aucune donnée réelle.
 * 32 clients de typologies variées (agence, santé, BTP, transport, ONG…),
 * couvrant les 4 statuts de facture et une large variété de prestations.
 */

export const company: Company = {
  name: "Kinshasa Créative",
  legalName: "Kinshasa Créative SARL",
  address: "12, avenue du Commerce, Gombe",
  city: "Kinshasa",
  country: "RD Congo",
  phone: "+243 81 234 56 78",
  email: "contact@kinshasa-creative.cd",
  rccm: "CD/KIN/RCCM/22-B-01234",
  nif: "A2201234X",
  idNat: "01-F4300-N01234X",
  currency: "CDF",
  defaultTvaRate: 16,
  invoicePrefix: "FAC",
  paymentTermsDays: 30,
  bankDetails: "Rawbank — Compte 00012-34567890-12 (CDF) — Titulaire : Kinshasa Créative SARL",
};

export const currentUser = {
  firstName: "Michel",
  lastName: "Kazadi",
  email: "michel@kinshasa-creative.cd",
  role: "Fondateur",
};

export const clients: Client[] = [
  { id: "cli_01", name: "Kivu Consulting", email: "compta@kivuconsulting.cd", phone: "+243 99 100 20 30", address: "Boulevard Kanyamuhanga, Goma, RD Congo", createdAt: "2025-10-14" },
  { id: "cli_02", name: "Congo Digital", email: "finance@congodigital.cd", phone: "+243 81 555 11 22", address: "Avenue de la Justice, Gombe, Kinshasa, RD Congo", createdAt: "2025-11-22" },
  { id: "cli_03", name: "Kinshasa Services SARL", email: "achats@kinshasa-services.cd", phone: "+243 82 300 44 55", address: "Route de Matadi, Limete, Kinshasa, RD Congo", createdAt: "2025-12-09" },
  { id: "cli_04", name: "Lumumba Consulting", email: "hello@lumumbaconsulting.cd", phone: "+243 89 777 66 55", address: "Avenue des Cliniques, Ngaliema, Kinshasa, RD Congo", createdAt: "2026-01-18" },
  { id: "cli_05", name: "Congo Business Solutions", email: "devis@congobusiness.cd", phone: "+243 97 200 33 44", address: "Avenue Lumumba, Lubumbashi, RD Congo", createdAt: "2026-02-11" },
  { id: "cli_06", name: "Kasaï Technologies", email: "contact@kasai-tech.cd", phone: "+243 84 611 22 77", address: "Avenue Kasa-Vubu, Kintambo, Kinshasa, RD Congo", createdAt: "2026-03-05" },
  { id: "cli_07", name: "Goma Logistics", email: "operations@gomalogistics.cd", phone: "+243 99 850 40 10", address: "Rond-point Signers, Goma, RD Congo", createdAt: "2026-04-02" },
  { id: "cli_08", name: "Nzambe Services", email: "bureau@nzambeservices.cd", phone: "+243 85 404 90 12", address: "Avenue du Port, Matadi, RD Congo", createdAt: "2026-05-19" },
  { id: "cli_09", name: "Mama Colette Traiteur", email: "commandes@mamacolette.cd", phone: "+243 81 902 14 28", address: "Avenue Kimwenza, Ngaba, Kinshasa, RD Congo", createdAt: "2025-09-03" },
  { id: "cli_10", name: "Pharmacie Boulevard", email: "gerance@pharmaboulevard.cd", phone: "+243 82 447 60 19", address: "Boulevard du 30 Juin, Gombe, Kinshasa, RD Congo", createdAt: "2025-09-20" },
  { id: "cli_11", name: "Clinique Bonne Santé", email: "administration@bonnesante.cd", phone: "+243 99 311 87 42", address: "Avenue de l'Hôpital, Lemba, Kinshasa, RD Congo", createdAt: "2025-10-28" },
  { id: "cli_12", name: "École Les Étoiles", email: "direction@lesetoiles-ecole.cd", phone: "+243 81 220 55 63", address: "Avenue Kalamu, Kalamu, Kinshasa, RD Congo", createdAt: "2025-11-06" },
  { id: "cli_13", name: "Garage Fiabilité", email: "atelier@garagefiabilite.cd", phone: "+243 97 633 18 05", address: "Route de Ndjili, Ndjili, Kinshasa, RD Congo", createdAt: "2025-12-15" },
  { id: "cli_14", name: "Hôtel Fleuve Congo", email: "reservation@hotelfleuvecongo.cd", phone: "+243 81 500 27 39", address: "Boulevard du 30 Juin, Gombe, Kinshasa, RD Congo", createdAt: "2026-01-09" },
  { id: "cli_15", name: "BTP Construction Plus", email: "projets@btpconstructionplus.cd", phone: "+243 82 719 33 84", address: "Avenue Bokasa, Masina, Kinshasa, RD Congo", createdAt: "2026-01-27" },
  { id: "cli_16", name: "Textile Wax Kinshasa", email: "boutique@textilewax.cd", phone: "+243 99 408 71 26", address: "Marché de la Liberté, Matete, Kinshasa, RD Congo", createdAt: "2026-02-14" },
  { id: "cli_17", name: "Immo Congo", email: "contact@immocongo.cd", phone: "+243 81 664 92 57", address: "Avenue des Aviateurs, Gombe, Kinshasa, RD Congo", createdAt: "2026-02-25" },
  { id: "cli_18", name: "Transport Malebo", email: "planning@transportmalebo.cd", phone: "+243 84 155 60 73", address: "Avenue du Beach, Kinshasa, RD Congo", createdAt: "2026-03-12" },
  { id: "cli_19", name: "Mines du Katanga SARL", email: "achats@minesdukatanga.cd", phone: "+243 97 822 46 91", address: "Avenue Mobutu, Lubumbashi, RD Congo", createdAt: "2026-03-21" },
  { id: "cli_20", name: "AgroCongo", email: "exploitation@agrocongo.cd", phone: "+243 82 366 10 48", address: "Route de Kikwit, Kikwit, RD Congo", createdAt: "2026-04-08" },
  { id: "cli_21", name: "Radio Horizon FM", email: "programmation@horizonfm.cd", phone: "+243 81 933 27 15", address: "Avenue Bandalungwa, Bandalungwa, Kinshasa, RD Congo", createdAt: "2026-04-17" },
  { id: "cli_22", name: "Assurance Fiabilité", email: "sinistres@assurancefiabilite.cd", phone: "+243 99 277 84 66", address: "Boulevard du 30 Juin, Gombe, Kinshasa, RD Congo", createdAt: "2026-04-29" },
  { id: "cli_23", name: "Event Prestige", email: "organisation@eventprestige.cd", phone: "+243 85 511 39 82", address: "Avenue Roi Baudouin, Ngaliema, Kinshasa, RD Congo", createdAt: "2026-05-06" },
  { id: "cli_24", name: "Boulangerie Pain Doré", email: "commandes@paindore.cd", phone: "+243 81 640 22 91", address: "Avenue Kasa-Vubu, Kasa-Vubu, Kinshasa, RD Congo", createdAt: "2026-05-14" },
  { id: "cli_25", name: "Studio Photo Kin", email: "studio@studiophotokin.cd", phone: "+243 97 458 63 20", address: "Avenue Tombalbaye, Bandalungwa, Kinshasa, RD Congo", createdAt: "2026-05-25" },
  { id: "cli_26", name: "Institut de Beauté Élégance", email: "rdv@institutelegance.cd", phone: "+243 82 195 74 33", address: "Avenue Colonel Ebeya, Gombe, Kinshasa, RD Congo", createdAt: "2026-06-03" },
  { id: "cli_27", name: "Cabinet Avocats Mbala", email: "secretariat@cabinetmbala.cd", phone: "+243 81 386 21 09", address: "Avenue Colonel Lukusa, Gombe, Kinshasa, RD Congo", createdAt: "2026-06-15" },
  { id: "cli_28", name: "Supermarché Fraîcheur", email: "direction@fraicheurmarket.cd", phone: "+243 99 704 58 17", address: "Avenue Kabinda, Limete, Kinshasa, RD Congo", createdAt: "2026-06-27" },
  { id: "cli_29", name: "Énergie Solaire RDC", email: "projets@energiesolairerdc.cd", phone: "+243 84 267 39 55", address: "Avenue Mama Yemo, Ngaliema, Kinshasa, RD Congo", createdAt: "2026-07-10" },
  { id: "cli_30", name: "Cyber Café Rapid Net", email: "gerant@rapidnet.cd", phone: "+243 97 519 84 02", address: "Avenue Kimbanseke, Kimbanseke, Kinshasa, RD Congo", createdAt: "2026-07-22" },
  { id: "cli_31", name: "Menuiserie Bois d'Ébène", email: "atelier@boisebene.cd", phone: "+243 81 872 40 66", address: "Avenue des Poids Lourds, Masina, Kinshasa, RD Congo", createdAt: "2026-08-04" },
  { id: "cli_32", name: "Fondation Espoir RDC", email: "administration@fondationespoir.cd", phone: "+243 82 630 95 41", address: "Avenue de la Paix, Gombe, Kinshasa, RD Congo", createdAt: "2026-08-19" },
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
  { id: "inv_01", number: "FAC-2026-0054", clientId: "cli_08", status: "brouillon", issueDate: "2026-09-18", dueDate: "2026-10-18", items: [
    { description: "Identité visuelle — logo et charte graphique", quantity: 1, unitPrice: 1_800_000 },
    { description: "Déclinaisons réseaux sociaux", quantity: 6, unitPrice: 95_000 },
  ] },
  { id: "inv_02", number: "FAC-2026-0053", clientId: "cli_06", status: "envoyee", issueDate: "2026-09-15", dueDate: "2026-10-15", items: [
    { description: "Refonte du site vitrine (6 pages)", quantity: 1, unitPrice: 3_200_000 },
    { description: "Séance photo produits", quantity: 1, unitPrice: 480_000 },
    { description: "Hébergement et nom de domaine (1 an)", quantity: 1, unitPrice: 260_000 },
  ] },
  { id: "inv_03", number: "FAC-2026-0052", clientId: "cli_32", status: "envoyee", issueDate: "2026-09-12", dueDate: "2026-10-12", items: [
    { description: "Accompagnement à la levée de fonds", quantity: 1, unitPrice: 950_000 },
    { description: "Rédaction rapport d'impact annuel", quantity: 1, unitPrice: 620_000 },
  ] },
  { id: "inv_04", number: "FAC-2026-0051", clientId: "cli_30", status: "brouillon", issueDate: "2026-09-10", dueDate: "2026-10-10", items: [
    { description: "Installation postes informatiques", quantity: 5, unitPrice: 180_000 },
    { description: "Configuration réseau et Wi-Fi", quantity: 1, unitPrice: 220_000 },
  ] },
  { id: "inv_05", number: "FAC-2026-0050", clientId: "cli_29", status: "envoyee", issueDate: "2026-09-08", dueDate: "2026-10-08", items: [
    { description: "Kit solaire résidentiel 3 kWc — fourniture", quantity: 2, unitPrice: 2_450_000 },
    { description: "Installation et mise en service", quantity: 2, unitPrice: 350_000 },
  ] },
  { id: "inv_06", number: "FAC-2026-0049", clientId: "cli_27", status: "payee", issueDate: "2026-09-05", dueDate: "2026-10-05", items: [
    { description: "Consultation juridique (forfait mensuel)", quantity: 1, unitPrice: 1_100_000 },
  ] },
  { id: "inv_07", number: "FAC-2026-0048", clientId: "cli_02", status: "payee", issueDate: "2026-09-01", dueDate: "2026-10-01", items: [
    { description: "Campagne publicitaire réseaux sociaux (1 mois)", quantity: 1, unitPrice: 980_000 },
  ] },
  { id: "inv_08", number: "FAC-2026-0047", clientId: "cli_25", status: "envoyee", issueDate: "2026-08-29", dueDate: "2026-09-28", items: [
    { description: "Reportage photo événement corporate", quantity: 1, unitPrice: 620_000 },
    { description: "Retouche et livraison numérique (80 photos)", quantity: 80, unitPrice: 4_500 },
  ] },
  { id: "inv_09", number: "FAC-2026-0046", clientId: "cli_24", status: "payee", issueDate: "2026-08-26", dueDate: "2026-09-25", items: [
    { description: "Fourniture pain et viennoiserie (commande hôtel, mensuel)", quantity: 1, unitPrice: 540_000 },
  ] },
  { id: "inv_10", number: "FAC-2026-0045", clientId: "cli_23", status: "en_retard", issueDate: "2026-07-30", dueDate: "2026-08-29", items: [
    { description: "Organisation soirée de gala (200 invités)", quantity: 1, unitPrice: 4_200_000 },
    { description: "Location sonorisation et éclairage", quantity: 1, unitPrice: 850_000 },
  ] },
  { id: "inv_11", number: "FAC-2026-0044", clientId: "cli_22", status: "payee", issueDate: "2026-08-22", dueDate: "2026-09-21", items: [
    { description: "Audit des contrats d'assurance flotte", quantity: 1, unitPrice: 1_350_000 },
  ] },
  { id: "inv_12", number: "FAC-2026-0043", clientId: "cli_21", status: "envoyee", issueDate: "2026-08-19", dueDate: "2026-09-18", items: [
    { description: "Production spot publicitaire radio (30 s)", quantity: 1, unitPrice: 380_000 },
    { description: "Diffusion antenne (2 semaines)", quantity: 14, unitPrice: 45_000 },
  ] },
  { id: "inv_13", number: "FAC-2026-0042", clientId: "cli_20", status: "payee", issueDate: "2026-08-15", dueDate: "2026-09-14", items: [
    { description: "Sacs d'engrais NPK 50 kg", quantity: 120, unitPrice: 42_000 },
    { description: "Transport et livraison entrepôt", quantity: 1, unitPrice: 380_000 },
  ] },
  { id: "inv_14", number: "FAC-2026-0041", clientId: "cli_19", status: "en_retard", issueDate: "2026-07-18", dueDate: "2026-08-17", items: [
    { description: "Prestation de maintenance industrielle", quantity: 1, unitPrice: 3_600_000 },
    { description: "Pièces détachées", quantity: 1, unitPrice: 1_240_000 },
  ] },
  { id: "inv_15", number: "FAC-2026-0040", clientId: "cli_18", status: "payee", issueDate: "2026-08-10", dueDate: "2026-09-09", items: [
    { description: "Transport de marchandises Kinshasa–Matadi (aller-retour)", quantity: 4, unitPrice: 310_000 },
  ] },
  { id: "inv_16", number: "FAC-2026-0039", clientId: "cli_17", status: "envoyee", issueDate: "2026-08-07", dueDate: "2026-09-06", items: [
    { description: "Commission de gestion locative (trimestre)", quantity: 1, unitPrice: 720_000 },
  ] },
  { id: "inv_17", number: "FAC-2026-0038", clientId: "cli_16", status: "payee", issueDate: "2026-08-03", dueDate: "2026-09-02", items: [
    { description: "Pagnes wax premium (pièces de 6 yards)", quantity: 25, unitPrice: 68_000 },
  ] },
  { id: "inv_18", number: "FAC-2026-0037", clientId: "cli_15", status: "en_retard", issueDate: "2026-07-08", dueDate: "2026-08-07", items: [
    { description: "Fourniture ciment et matériaux gros œuvre", quantity: 1, unitPrice: 2_850_000 },
    { description: "Main d'œuvre chantier (semaine)", quantity: 3, unitPrice: 620_000 },
  ] },
  { id: "inv_19", number: "FAC-2026-0036", clientId: "cli_14", status: "payee", issueDate: "2026-07-29", dueDate: "2026-08-28", items: [
    { description: "Séminaire entreprise — location salle + pause-café", quantity: 1, unitPrice: 1_450_000 },
  ] },
  { id: "inv_20", number: "FAC-2026-0035", clientId: "cli_13", status: "payee", issueDate: "2026-07-25", dueDate: "2026-08-24", items: [
    { description: "Révision complète véhicule utilitaire", quantity: 2, unitPrice: 245_000 },
    { description: "Pneumatiques (jeu de 4)", quantity: 1, unitPrice: 680_000 },
  ] },
  { id: "inv_21", number: "FAC-2026-0034", clientId: "cli_12", status: "envoyee", issueDate: "2026-07-21", dueDate: "2026-08-20", items: [
    { description: "Uniformes scolaires (lot de 40)", quantity: 40, unitPrice: 32_000 },
  ] },
  { id: "inv_22", number: "FAC-2026-0033", clientId: "cli_11", status: "payee", issueDate: "2026-07-17", dueDate: "2026-08-16", items: [
    { description: "Fourniture consommables médicaux (mensuel)", quantity: 1, unitPrice: 890_000 },
  ] },
  { id: "inv_23", number: "FAC-2026-0032", clientId: "cli_10", status: "payee", issueDate: "2026-07-14", dueDate: "2026-08-13", items: [
    { description: "Réapprovisionnement stock pharmaceutique", quantity: 1, unitPrice: 1_620_000 },
  ] },
  { id: "inv_24", number: "FAC-2026-0031", clientId: "cli_09", status: "en_retard", issueDate: "2026-06-20", dueDate: "2026-07-20", items: [
    { description: "Traiteur mariage (150 couverts)", quantity: 150, unitPrice: 18_000 },
    { description: "Service et logistique", quantity: 1, unitPrice: 420_000 },
  ] },
  { id: "inv_25", number: "FAC-2026-0030", clientId: "cli_08", status: "payee", issueDate: "2026-07-06", dueDate: "2026-08-05", items: [
    { description: "Enseigne lumineuse", quantity: 1, unitPrice: 1_550_000 },
    { description: "Cartes de visite (1000 ex.)", quantity: 1, unitPrice: 165_000 },
  ] },
  { id: "inv_26", number: "FAC-2026-0029", clientId: "cli_07", status: "payee", issueDate: "2026-07-02", dueDate: "2026-08-01", items: [
    { description: "Entreposage marchandises (mois)", quantity: 1, unitPrice: 540_000 },
    { description: "Manutention et chargement", quantity: 6, unitPrice: 45_000 },
  ] },
  { id: "inv_27", number: "FAC-2026-0028", clientId: "cli_06", status: "payee", issueDate: "2026-06-28", dueDate: "2026-07-28", items: [
    { description: "Maintenance parc informatique (trimestre)", quantity: 1, unitPrice: 980_000 },
  ] },
  { id: "inv_28", number: "FAC-2026-0027", clientId: "cli_05", status: "en_retard", issueDate: "2026-06-24", dueDate: "2026-07-24", items: [
    { description: "Habillage de flotte (4 véhicules)", quantity: 4, unitPrice: 720_000 },
    { description: "Pose sur site", quantity: 1, unitPrice: 350_000 },
  ] },
  { id: "inv_29", number: "FAC-2026-0026", clientId: "cli_04", status: "payee", issueDate: "2026-06-19", dueDate: "2026-07-19", items: [
    { description: "Étude de marché — expansion régionale", quantity: 1, unitPrice: 1_950_000 },
  ] },
  { id: "inv_30", number: "FAC-2026-0025", clientId: "cli_03", status: "en_retard", issueDate: "2026-06-15", dueDate: "2026-07-15", items: [
    { description: "Nettoyage industriel (contrat mensuel)", quantity: 1, unitPrice: 460_000 },
  ] },
  { id: "inv_31", number: "FAC-2026-0024", clientId: "cli_02", status: "payee", issueDate: "2026-06-11", dueDate: "2026-07-11", items: [
    { description: "Packaging gamme jus (3 références)", quantity: 3, unitPrice: 590_000 },
    { description: "Bon à tirer et suivi imprimeur", quantity: 1, unitPrice: 240_000 },
  ] },
  { id: "inv_32", number: "FAC-2026-0023", clientId: "cli_01", status: "payee", issueDate: "2026-06-07", dueDate: "2026-07-07", items: [
    { description: "Stand salon 6x3 m — conception", quantity: 1, unitPrice: 1_900_000 },
    { description: "Kakémonos", quantity: 4, unitPrice: 110_000 },
  ] },
  { id: "inv_33", number: "FAC-2026-0022", clientId: "cli_32", status: "payee", issueDate: "2026-06-02", dueDate: "2026-07-02", items: [
    { description: "Formation des bénévoles (2 jours)", quantity: 1, unitPrice: 480_000 },
  ] },
  { id: "inv_34", number: "FAC-2026-0021", clientId: "cli_31", status: "payee", issueDate: "2026-05-29", dueDate: "2026-06-28", items: [
    { description: "Mobilier sur mesure (bureaux, lot de 6)", quantity: 6, unitPrice: 165_000 },
  ] },
  { id: "inv_35", number: "FAC-2026-0020", clientId: "cli_28", status: "payee", issueDate: "2026-05-25", dueDate: "2026-06-24", items: [
    { description: "Rayonnage et agencement magasin", quantity: 1, unitPrice: 2_100_000 },
  ] },
  { id: "inv_36", number: "FAC-2026-0019", clientId: "cli_26", status: "payee", issueDate: "2026-05-21", dueDate: "2026-06-20", items: [
    { description: "Forfait soins visage et coiffure (événement)", quantity: 12, unitPrice: 55_000 },
  ] },
  { id: "inv_37", number: "FAC-2026-0018", clientId: "cli_14", status: "payee", issueDate: "2026-05-17", dueDate: "2026-06-16", items: [
    { description: "Linge et blanchisserie (mensuel)", quantity: 1, unitPrice: 310_000 },
  ] },
  { id: "inv_38", number: "FAC-2026-0017", clientId: "cli_09", status: "payee", issueDate: "2026-05-13", dueDate: "2026-06-12", items: [
    { description: "Traiteur séminaire entreprise (80 couverts)", quantity: 80, unitPrice: 16_500 },
  ] },
  { id: "inv_39", number: "FAC-2026-0016", clientId: "cli_07", status: "payee", issueDate: "2026-05-09", dueDate: "2026-06-08", items: [
    { description: "Transport conteneur (Goma–Kinshasa)", quantity: 1, unitPrice: 3_400_000 },
  ] },
  { id: "inv_40", number: "FAC-2026-0015", clientId: "cli_06", status: "payee", issueDate: "2026-05-05", dueDate: "2026-06-04", items: [
    { description: "Landing page campagne", quantity: 1, unitPrice: 1_350_000 },
    { description: "Intégration emailing", quantity: 1, unitPrice: 420_000 },
  ] },
  { id: "inv_41", number: "FAC-2026-0014", clientId: "cli_08", status: "payee", issueDate: "2026-08-24", dueDate: "2026-09-23", items: [
    { description: "Refonte identité visuelle succursale", quantity: 1, unitPrice: 1_200_000 },
  ] },
  { id: "inv_42", number: "FAC-2026-0013", clientId: "cli_13", status: "payee", issueDate: "2026-04-27", dueDate: "2026-05-27", items: [
    { description: "Diagnostic électronique flotte", quantity: 5, unitPrice: 85_000 },
  ] },
  { id: "inv_43", number: "FAC-2026-0012", clientId: "cli_02", status: "payee", issueDate: "2026-04-23", dueDate: "2026-05-23", items: [
    { description: "Campagne d'affichage — conception", quantity: 1, unitPrice: 1_150_000 },
    { description: "Impression bâches 3x2 m", quantity: 8, unitPrice: 130_000 },
  ] },
  { id: "inv_44", number: "FAC-2026-0011", clientId: "cli_01", status: "payee", issueDate: "2026-04-19", dueDate: "2026-05-19", items: [
    { description: "Catalogue produits 24 pages", quantity: 1, unitPrice: 2_100_000 },
    { description: "Retouches photo", quantity: 30, unitPrice: 18_000 },
  ] },
  { id: "inv_45", number: "FAC-2026-0010", clientId: "cli_11", status: "payee", issueDate: "2026-04-15", dueDate: "2026-05-15", items: [
    { description: "Équipement salle de soins", quantity: 1, unitPrice: 2_450_000 },
  ] },
  { id: "inv_46", number: "FAC-2026-0009", clientId: "cli_03", status: "payee", issueDate: "2026-04-11", dueDate: "2026-05-11", items: [
    { description: "Gardiennage et sécurité (mensuel)", quantity: 1, unitPrice: 680_000 },
  ] },
  { id: "inv_47", number: "FAC-2026-0008", clientId: "cli_04", status: "payee", issueDate: "2026-04-06", dueDate: "2026-05-06", items: [
    { description: "Motion design — vidéo 45 s", quantity: 1, unitPrice: 2_650_000 },
  ] },
  { id: "inv_48", number: "FAC-2026-0007", clientId: "cli_18", status: "payee", issueDate: "2026-04-02", dueDate: "2026-05-02", items: [
    { description: "Location camion + chauffeur (semaine)", quantity: 1, unitPrice: 1_150_000 },
  ] },
  { id: "inv_49", number: "FAC-2026-0006", clientId: "cli_02", status: "payee", issueDate: "2026-03-29", dueDate: "2026-04-28", items: [
    { description: "Refonte identité de marque", quantity: 1, unitPrice: 1_780_000 },
  ] },
  { id: "inv_50", number: "FAC-2026-0005", clientId: "cli_01", status: "payee", issueDate: "2026-03-25", dueDate: "2026-04-24", items: [
    { description: "Étude de positionnement concurrentiel", quantity: 1, unitPrice: 1_320_000 },
  ] },
  { id: "inv_51", number: "FAC-2026-0004", clientId: "cli_15", status: "payee", issueDate: "2026-03-21", dueDate: "2026-04-20", items: [
    { description: "Étude de sol et fondations", quantity: 1, unitPrice: 1_680_000 },
  ] },
  { id: "inv_52", number: "FAC-2026-0003", clientId: "cli_12", status: "payee", issueDate: "2026-03-17", dueDate: "2026-04-16", items: [
    { description: "Fournitures scolaires (rentrée)", quantity: 1, unitPrice: 940_000 },
  ] },
  { id: "inv_53", number: "FAC-2026-0002", clientId: "cli_05", status: "payee", issueDate: "2026-03-13", dueDate: "2026-04-12", items: [
    { description: "Charte documentaire (modèles Word/PPT)", quantity: 1, unitPrice: 1_080_000 },
  ] },
  { id: "inv_54", number: "FAC-2026-0001", clientId: "cli_04", status: "payee", issueDate: "2026-03-09", dueDate: "2026-04-08", items: [
    { description: "Direction artistique — shooting mode", quantity: 1, unitPrice: 2_000_000 },
    { description: "Location studio (2 jours)", quantity: 2, unitPrice: 360_000 },
  ] },
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
