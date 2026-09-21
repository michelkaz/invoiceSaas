# Facturi — SaaS de facturation pour entrepreneurs congolais (RDC)

Application web de facturation destinée aux entrepreneurs, indépendants, TPE et
PME de **République Démocratique du Congo**, avec **Kinshasa** comme marché de
lancement (extension prévue vers Lubumbashi, Goma, puis l'Afrique francophone).
Elle permet de créer des factures conformes, suivre les paiements et piloter son
activité depuis un tableau de bord.

**Stack :** Next.js 14 (App Router) · React 18 · TypeScript strict · Tailwind CSS ·
déploiement **Vercel**. Base de données **Supabase** (branchée : Auth + Postgres +
RLS multi-tenant — voir §11).
**Commentaires de code : français.** **UI : bilingue FR (défaut) / EN** — i18n
maison dans `lib/i18n/` (dictionnaires `fr.ts` / `en.ts`, `makeTranslator`),
`components/providers/i18n-provider.tsx` (`useT()` / `useI18n()`), locale en
cookie `facturi_locale`, `getServerLocale()` / `getServerT()` côté serveur.
**Tout texte visible passe par `t("namespace.key")`** — ne jamais coder un
libellé en dur. `<LanguageSwitcher>` (topbar, landing, pages d'auth).
**Devise : franc congolais (CDF), affiché « FC ».** **TVA par défaut : 16 %.**

---

## 1. Ce que fait l'application

**Utilisateur type :** un entrepreneur kinois (graphiste, consultant, commerce,
agence, prestataire, petite structure) qui facture des clients en francs
congolais et veut un outil simple, en français, adapté à la TVA locale (16 %) et
aux mentions légales de la RDC (RCCM, NIF, ID NAT).

**Tâches couvertes :**

1. **Voir son activité en un coup d'œil** — nombre de factures émises, montant
   facturé, montant payé, montant en attente, revenus par mois, répartition par
   statut, dernières factures.
2. **Créer une facture** — sélection d'un client, dates d'émission / d'échéance,
   lignes dynamiques (description, quantité, prix unitaire), calcul automatique du
   sous-total, de la **TVA 16 %** et du total TTC, tout en FC.
3. **Gérer le cycle de vie d'une facture** — brouillon → envoyée → payée, plus
   « en retard » ; consultation d'un rendu type document ; modification ;
   suppression avec confirmation.
4. **Gérer ses clients** — nom, email, téléphone, adresse ; ajout / modification
   dans une modale ; suppression (bloquée si des factures sont liées).
5. **Configurer son entreprise** — identité, coordonnées, **RCCM / NIF / ID NAT**,
   devise (**CDF** par défaut, XOF/XAF disponibles), taux de TVA par défaut,
   préfixe de numérotation, délai de paiement, coordonnées bancaires ; ces
   informations alimentent l'en-tête des factures.
6. **Trouver de l'aide** — FAQ, contact, ressources.
7. **Découvrir le produit (public)** — landing page marketing sur `/`
   (positionnement Kinshasa/RDC, tarifs en FC), voir §4.

**Déjà en place :** authentification Supabase complète (inscription, connexion,
vérification email, mot de passe oublié/reset, suppression de compte), RLS
multi-tenant, persistance serveur, onboarding + tutoriel interactif, export PDF
(`@react-pdf/renderer`), envoi de facture par email (Resend, si configuré),
landing page publique.
**Pas encore :** intégrations de paiement (Mobile Money…), upload de logo,
relances automatiques, multi-utilisateurs par entreprise. Voir la roadmap (§14).

---

## 2. Fonctionnalités implémentées (par écran)

Toutes les pages applicatives vivent sous `app/(app)/` et héritent du shell
(sidebar + topbar). Racine `/` → redirection vers `/dashboard`.

| Route | Écran | Fonctionnalités |
|---|---|---|
| `/dashboard` | **Tableau de bord** | 4 cartes de stats (factures émises, montant facturé, montant payé, montant en attente) + mini-sparkline ; graphique **Revenus facturés** (8 mois, barres SVG) ; **donut** de répartition par statut + légende avec montants ; tableau **Dernières factures** avec onglets Toutes / Payées / Impayées et lien « Voir tout ». |
| `/invoices` | **Liste des factures** | Tableau complet ; filtres par statut (Tous / Brouillon / Envoyée / Payée / En retard) avec compteurs ; recherche par nom de client ou numéro ; menu d'actions par ligne (Voir, Modifier, changer de statut, Supprimer) ; suppression avec `ConfirmDialog` ; états vides. |
| `/invoices/new` | **Créer une facture** | Sélection client (avec lien vers `/clients` si aucun) ; date d'émission = aujourd'hui, échéance = +`paymentTermsDays` jours ; **lignes dynamiques** (ajouter / supprimer, min. 1) ; total de ligne auto ; récapitulatif live sous-total / TVA (16 %) / **Total TTC** ; notes ; validation (client requis, ≥ 1 ligne valide, qté > 0, échéance ≥ émission) ; boutons **Sauvegarder comme brouillon** / **Envoyer la facture**. Numéro attribué : `FAC-<année>-<seq:0004>`. |
| `/invoices/[id]` | **Détail facture** | Rendu type document : bloc entreprise, bloc « Facturé à », tableau des lignes, totaux, notes, coordonnées bancaires ; **Changer le statut** (dropdown) ; **Modifier** ; **Supprimer** (confirmation → retour à la liste) ; états « introuvable » et chargement. |
| `/invoices/[id]/edit` | **Modifier une facture** | Même formulaire que la création, pré-rempli. Si brouillon : « Enregistrer » + « Enregistrer et envoyer ». Sinon : « Enregistrer les modifications » (statut conservé). |
| `/clients` | **Clients** | Liste triée + recherche (nom / email) ; **Ajouter** / **Modifier** via `ClientFormModal` (nom*, email* + validation format, téléphone, adresse) ; **Supprimer** (`ConfirmDialog`), **bloquée** avec toast si le client a des factures ; compteur de factures par client ; état vide. |
| `/settings` | **Paramètres** | Formulaire entreprise en sections (Identité + RCCM/NIF/ID NAT, Coordonnées, Facturation, Coordonnées bancaires) ; devise CDF/XOF/XAF ; TVA (16 % défaut), préfixe, délai de paiement ; zone d'upload logo **désactivée** (attente Supabase Storage) ; **« Charger les données de démo »** ; **« Revoir le tutoriel »** ; **« Supprimer mon compte »** (`ConfirmDialog`). |
| `/` | **Landing page** (publique) | Page marketing RSC : header sticky + menu mobile, hero + mockups (dashboard/facture en FC), problèmes, fonctionnalités, « comment ça marche », aperçu PDF, suivi des paiements (Mobile Money/M-Pesa/Airtel/Orange = **illustratifs**), « Pensé pour la RDC », tarifs (0 / 15 000 / 35 000 FC), témoignages fictifs Kinshasa, FAQ, CTA, footer 🇨🇩. Un utilisateur connecté est redirigé vers `/dashboard`. |
| `/help` | **Aide & support** | FAQ en accordéon natif (`<details>`), carte contact (email `mailto:`, téléphone), liste de ressources. Écran statique (RSC). |

**Transverses :** toasts (`useToast`) sur toutes les mutations (succès / erreur) ;
navigation sidebar avec état actif ; drawer hamburger sous `lg`.

---

## 3. Technologies

| Domaine | Choix | Version | Notes |
|---|---|---|---|
| Framework | Next.js **App Router** | `14.2.35` | `next.config.mjs` minimal (`reactStrictMode`). |
| UI | React | `18.3.1` | |
| Langage | TypeScript | `5.5.3` | `strict: true`. Alias `@/*` → racine. |
| Styles | Tailwind CSS | `3.4.14` | `tailwind.config.ts` — thème étendu (voir §7). PostCSS + Autoprefixer. |
| Icônes | `lucide-react` | `0.454.0` | Import par icône (tree-shaké). |
| Utilitaires classes | `clsx` + `tailwind-merge` | | Exposés via `cn()` — [lib/utils.ts](lib/utils.ts). |
| Police | Inter via `next/font/google` | | Variable `--font-inter`, `display: "swap"`. |
| Lint | `eslint-config-next` (`core-web-vitals`) | `14.2.35` | Pas de Prettier ni de plugins ESLint supplémentaires. |
| Données (actuel) | React Context + `localStorage` | — | Clé `facturi:data:v1`. Voir §6. |
| Données (cible) | **Supabase** (Postgres + Auth + Storage + RLS) | — | Non branché. |
| Tests | **aucun** pour l'instant | — | Vitest + Playwright prévus (Itération 0 du plan, §11). |
| Graphiques | **SVG fait main** (pas de lib) | — | `viewBox` fluide + `role="img"`/`aria-label`. Décision §10. |
| Déploiement | Vercel | — | |

**Aucune autre dépendance runtime** que `next`, `react`, `react-dom`, `clsx`,
`tailwind-merge`, `lucide-react`. First Load JS du dashboard ≈ 113 kB.

---

## 4. Structure des fichiers

```
app/
  layout.tsx                     RSC — <html lang="fr">, police Inter, metadata globale
  page.tsx                       RSC — redirect('/dashboard')
  globals.css                    @tailwind + <body> + :focus-visible global + .no-scrollbar
  (app)/
    layout.tsx                   RSC — <DataProvider><ToastProvider><AppShell>{children}
    dashboard/
      layout.tsx                 RSC — exporte `metadata` (page = client, cf. §10) ; return children
      page.tsx                   "use client" — lit useData(), calcule les stats, assemble 4 sections
    invoices/
      page.tsx                   → <InvoicesView />
      new/page.tsx               PageHeader + <InvoiceForm mode="create" />
      [id]/page.tsx              → <InvoiceDetail invoiceId={params.id} />
      [id]/edit/page.tsx         PageHeader + <InvoiceForm mode="edit" invoiceId=… />
    clients/page.tsx             → <ClientsView />
    settings/page.tsx            → <SettingsView />
    help/page.tsx                RSC statique (FAQ + contact + ressources)

components/
  providers/
    data-provider.tsx            "use client" — store local persistant, hook useData()  [NE PAS MODIFIER — cf. §11]
  layout/
    app-shell.tsx                "use client" — état du drawer mobile ; sidebar + topbar + <main>
    sidebar.tsx                  "use client" — desktop fixe + drawer mobile ; logo, nav, carte "Pro"
    topbar.tsx                   "use client" — salutation, recherche*, cloche*, bouton "Créer", menu user*
    nav.ts                       Données de navigation (navSections). Ajouter une entrée ici, pas dans le composant.
  ui/                            PRIMITIVES DU DESIGN SYSTEM (voir §9)
    button.tsx                   <button>/<Link> polymorphe · variants primary/secondary/outline/ghost/danger · loading
    card.tsx                     Card · CardHeader(title, description, action) · CardBody
    field.tsx                    Field(label, error, hint) + CONTROL_BASE/OK/ERROR + controlClass()
    input.tsx  select.tsx  textarea.tsx   contrôles de formulaire (useId pour l'association label)
    page-header.tsx              titre + description + actions + backHref optionnel
    segmented-tabs.tsx           filtres à onglets (bg-slate-100, actif = bg-white shadow) · compteurs optionnels
    search-input.tsx             champ recherche contrôlé, effaçable
    table.tsx                    Table(minWidth) · THead · TH · TBody · TR(onClick) · TD  — wrappé dans overflow-x-auto
    modal.tsx                    Modal(open, onClose, title, footer) — Échap, scroll-lock, backdrop, role="dialog"
    confirm-dialog.tsx           au-dessus de Modal — Annuler / Confirmer (variant danger|primary)
    dropdown-menu.tsx            "use client" — popover d'actions ; clic-dehors + Échap
    empty-state.tsx              icône + titre + description + action
    toast.tsx                    ToastProvider + useToast() ; pile bas-droite, auto-dismiss ~3,8 s
    avatar.tsx                   initiales, couleur dérivée du nom (hash), tailles sm/md/lg
  invoices/
    status-badge.tsx            <StatusBadge status> (alias <InvoiceStatusBadge>) — pastille + libellé par statut
    password-input.tsx          <PasswordInput> — champ mot de passe + bascule afficher/masquer (Eye/EyeOff)
    image-upload.tsx            <ImageUpload> — upload Supabase Storage (bucket « assets »), logo entreprise + photo de profil
    language-switcher.tsx       <LanguageSwitcher> — bascule FR / EN (cookie + reload)
    invoice-form.tsx            "use client" — création + édition (417 lignes : état + validation + vue)
    invoices-view.tsx           "use client" — liste + filtres + recherche + actions
    invoice-detail.tsx          "use client" — rendu document (template « moderne épuré » : bandeau violet, logo, bloc facture encadré, Total TTC en encart) + statut + suppression + <InvoicePdfActions>
    invoice-pdf-actions.tsx     "use client" — Prévisualiser / Télécharger / Imprimer / Envoyer (PDF via @react-pdf, chargé à la demande)
  clients/
    clients-view.tsx            "use client" — liste + recherche + actions
    client-form-modal.tsx       "use client" — formulaire ajout / édition dans une Modal
  settings/
    settings-view.tsx           "use client" — formulaire entreprise + zone de danger
  dashboard/
    stat-card.tsx               carte de stat (icône, valeur, label, sparkline SVG) [+ puce de tendance — factice, à retirer]
    revenue-chart.tsx           barres SVG viewBox, grille + libellés axes, tooltip natif <title>
    status-donut.tsx            donut SVG (stroke-dasharray) + légende
    recent-invoices.tsx         "use client" — carte + SegmentedTabs + Table

lib/
  utils.ts                       cn() (clsx + tailwind-merge)
  money.ts                       formatNumber, formatFCFA (-> "… FC"), formatCompactFCFA  (CDF = entiers, 0 décimale)
  format.ts                      formatDate (jj/mm/aaaa), formatDateLong*, monthLabel, todayISO, addDaysISO
  invoice-calc.ts                lineTotal, subtotal, tvaAmount, computeInvoiceTotals  (fonctions pures)
  invoice-status.ts              INVOICE_STATUSES, STATUS_LABEL, STATUS_ACTION_LABEL
  dashboard-stats.ts             getOverview, getMonthlySeries, getMonthlyRevenue, getStatSeries, getStatusBreakdown
  data/
    types.ts                     InvoiceStatus, Client, InvoiceItem, Invoice, Company, InvoiceWithClient
    mock.ts                      SEED : company "Kinshasa Créative" (Kinshasa, CDF, TVA 16), currentUser "Michel Kazadi", 8 clients congolais fictifs, 14 factures en FC

CLAUDE.md                        ce fichier
tailwind.config.ts  tsconfig.json  next.config.mjs  postcss.config.mjs  .eslintrc.json
```

`*` = actuellement **inutilisé ou factice** : `formatDateLong` (jamais importé),
`getInvoicesWithClient` dans `mock.ts` (jamais importé), recherche / cloche / menu
user de la topbar (UI non branchée), puce de tendance des `StatCard` (pourcentages
codés en dur). À nettoyer — voir §11.

---

## 5. Modèle de données

Types : [lib/data/types.ts](lib/data/types.ts). Ils sont **alignés sur le futur
schéma Supabase**.

```ts
type InvoiceStatus = "brouillon" | "envoyee" | "payee" | "en_retard";

interface Client   { id; name; email; phone; address; createdAt; }
interface InvoiceItem { id; description; quantity; unitPrice; }
interface Invoice  {
  id; number;                      // "FAC-2026-0007"
  clientId; status;
  issueDate; dueDate;              // ISO court "AAAA-MM-JJ"
  currency: "XOF" | "XAF" | "CDF";
  tvaRate;                          // figé sur la facture (16 % par défaut)
  items: InvoiceItem[];
  subtotal; tvaAmount; total;       // FIGÉS à l'écriture (ne pas recalculer à l'affichage)
  notes?;
}
interface Company  {
  name; legalName; address; city; country; phone; email;
  rccm; nif; idNat;                 // identifiants légaux RDC
  currency; defaultTvaRate; invoicePrefix; paymentTermsDays; bankDetails?;
}
interface InvoiceWithClient extends Invoice { client?: Client; }
```

### Couche d'accès — `useData()` ([components/providers/data-provider.tsx](components/providers/data-provider.tsx))

Store React Context, persisté dans `localStorage` (clé **`facturi:data:v1`**),
initialisé depuis [lib/data/mock.ts](lib/data/mock.ts). Toute page qui lit `useData()`
devient cliente.

```
{ hydrated, clients, invoices, company,
  getClient(id), getInvoice(id), invoiceCountForClient(clientId),
  addClient(data) → Client, updateClient(id, data), deleteClient(id),
  nextInvoiceNumber() → string,
  addInvoice(input, status) → Invoice, updateInvoice(id, input),
  deleteInvoice(id), setInvoiceStatus(id, status),
  updateCompany(data), resetDemoData() }
```

- **Numérotation :** `computeNextNumber` = `{invoicePrefix}-{année}-{séquence sur 4}`,
  séquence = max des numéros existants de l'année + 1.
- **Totaux :** calculés par `computeInvoiceTotals` (règle : **arrondi au franc par
  ligne, puis somme**) à la création / édition, puis **figés** sur la facture.
- **`hydrated` :** `false` au 1er rendu (SSR + hydratation avec le seed), `true`
  après lecture de `localStorage`. Utilisé pour les états de chargement.
- **`resetDemoData()` :** réécrit le seed (déclenché depuis Paramètres).

---

## 6. Design System global — RÈGLE OBLIGATOIRE

Le SaaS utilise un **Design System centralisé**. Le Dashboard a été la première
implémentation de référence.

> **Toutes les pages doivent parler le même langage visuel.**
> Une nouvelle page ne doit **jamais** introduire un style indépendant : elle doit
> sembler appartenir au même produit que le Dashboard.

### Règle prioritaire (avant de coder une page ou une fonctionnalité)

1. Identifier les composants de `components/ui/` (et `layout/`) nécessaires et **les
   réutiliser**.
2. Si un composant manque : créer un **composant générique** dans `components/ui/`,
   avec tous ses états et son comportement responsive — puis l'utiliser.
3. Ne jamais écrire une solution visuelle spécifique à une seule page si elle peut
   être généralisée. Si le Dashboard contenait une version locale d'un pattern,
   la refactorer au passage.

### Interdits

- Valeurs Tailwind arbitraires **lorsqu'un cran de l'échelle ou un token répond au
  besoin** (`p-[13px]`, `text-[#7c3aed]`…). *(Une valeur arbitraire ciblée et
  justifiée reste permise — ex. `max-w-[1400px]` pour la largeur de contenu.)*
- Styles inline (`style={{…}}`) sauf calcul dynamique impossible autrement
  (ex. hauteur d'une barre de graphique, couleur `stroke` d'un SVG).
- Couleurs / libellés de statut redéfinis d'un fichier à l'autre.
- Composants dupliqués ou recopiés d'une page à l'autre.
- Contrôles interactifs sans `type="button"` explicite (hors `submit` volontaire).

---

## 7. Tokens de design

Source de vérité : [tailwind.config.ts](tailwind.config.ts) + [app/globals.css](app/globals.css).

### Couleurs

| Rôle | Valeur |
|---|---|
| Primaire | `brand-600` (#7c3aed) · hover `brand-700` · surfaces légères `brand-50` |
| Échelle primaire | `brand-50 … brand-900` (violet) — définie dans `tailwind.config.ts` |
| Fond de page | `bg-slate-50` (posé sur `<body>` via `globals.css`) |
| Surface / cartes | `bg-white` |
| Texte principal | `text-slate-900` |
| Texte secondaire | `text-slate-600` / **`text-slate-500` (minimum pour du texte lisible — ≥ 4.5:1)** |
| Décoratif uniquement | `text-slate-400` — **icônes / éléments non porteurs de sens** ; jamais pour du texte |
| Bordure carte | `border-slate-200` |
| Séparateur | `border-slate-100` / `divide-slate-100` (max 1 px) |
| Focus | `ring-2 ring-brand-500 ring-offset-2` — **global** dans `globals.css` (`:focus-visible`) |

### Couleurs & libellés de statut de facture

| Statut | Ton | Libellé |
|---|---|---|
| `payee` | emerald (vert) | « Payée » |
| `envoyee` | amber (orange) | « Envoyée » |
| `brouillon` | slate (gris) | « Brouillon » |
| `en_retard` | rose (rouge) | « En retard » |

→ **Toujours** passer par `<StatusBadge status={…} />`
([components/invoices/status-badge.tsx](components/invoices/status-badge.tsx)) et par
les libellés de [lib/invoice-status.ts](lib/invoice-status.ts). Ne jamais recopier
ces classes ni ces chaînes. *(Consolidation en cours : un objet unique
`INVOICE_STATUS_META { label, badgeClass, dotClass, hex }` dans `invoice-status.ts`
doit devenir la seule source — cf. §11. Aujourd'hui la couleur est encore
partiellement dupliquée dans `status-donut.tsx` et `dashboard-stats.ts`.)*

### Typographie

- Police : **Inter** (`font-sans`).
- Titre de page : `text-2xl font-bold tracking-tight text-slate-900`
- Titre de section / carte : `text-base font-semibold text-slate-900`
- Sous-titre : `text-sm text-slate-500`
- Corps : `text-sm`
- Label / méta : `text-xs`
- Valeurs chiffrées : `text-2xl font-bold tracking-tight` + `tabular-nums`
- En-têtes de tableau : `text-xs uppercase tracking-wider` + `text-slate-500`

### Espacements

- Entre sections d'une page : `space-y-6`
- Entre éléments d'une grille : `gap-4`
- Padding carte / section : `p-5 sm:p-6`
- Cellules de tableau : `px-5 py-4` (en-tête `py-3.5`)

### Border radius

| Élément | Radius |
|---|---|
| Cartes, sections, modales | `rounded-2xl` |
| Boutons, inputs, selects | `rounded-xl` |
| Petits contrôles (icon-buttons, items de menu) | `rounded-lg` |
| Badges, pills, avatars | `rounded-full` |

### Bordures & ombres

- Bordure standard : `border border-slate-200`
- Ombre carte (élévation par défaut) : `shadow-card` (token)
- Ombre overlay (dropdown, modale, drawer, toast) : `shadow-pop` (token)

### Animations

`animate-fade-in` (150 ms) · `animate-slide-in` (200 ms) — définies dans
`tailwind.config.ts`. **À neutraliser sous `prefers-reduced-motion: reduce`**
(non fait — cf. §11).

---

## 8. Layout & responsive

- **Shell** ([components/layout/app-shell.tsx](components/layout/app-shell.tsx)) :
  sidebar fixe `w-64` en `lg+`, drawer + overlay hamburger sous `lg`.
  Contenu : `<main class="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">`.
- **Navigation** pilotée par [components/layout/nav.ts](components/layout/nav.ts)
  (`navSections`). Ajouter une entrée = éditer ce fichier.
- **Breakpoints** : ceux de Tailwind (`sm 640 · md 768 · lg 1024 · xl 1280`).
  Bascule sidebar ⇄ hamburger : `lg`. Grille des cartes de stats :
  `grid-cols-1 → sm:grid-cols-2 → xl:grid-cols-4`.
- **Mobile-first.** **Aucun défilement horizontal au niveau du document, à aucune
  largeur.** Le contenu large (tableaux) défile dans son propre conteneur
  `overflow-x-auto` (composant `Table`).
- **Graphiques** : SVG `viewBox` fluide (jamais de layout flex à largeur minimale).
- Vérification : `scrollWidth === clientWidth` à **360 / 768 / 1024 / 1280 / 1440 /
  1920** px (1280 est le point sensible, cf. §11 A-01).

### États des composants interactifs

Chaque composant interactif prévoit : `default`, `hover`, `active`, `focus-visible`,
`disabled`, et selon le cas `loading`, `error`, `success`, `empty`.

---

## 9. Formatage des données (cohérent partout)

| Donnée | Règle | Helper |
|---|---|---|
| Montants | `250 000 FC` — entier, 0 décimale, séparateur de milliers (`Intl` fr-FR) | `formatFCFA()` — [lib/money.ts](lib/money.ts) |
| Montants compacts (axes de graphes) | `1,3 M` / `750 k` | `formatCompactFCFA()` |
| Dates | `27/08/2026` (jj/mm/aaaa) | `formatDate()` — [lib/format.ts](lib/format.ts) |
| Statut de facture | pastille + libellé | `<StatusBadge status />` |
| Initiales / avatar | couleur dérivée du nom | `<Avatar name />` |

- **Calculs de facturation :** uniquement [lib/invoice-calc.ts](lib/invoice-calc.ts).
  TVA 16 % par défaut, **arrondi au franc par ligne puis somme**. Les totaux sont
  figés sur la facture — **ne pas les recalculer à l'affichage**.
- **Stats du dashboard :** uniquement [lib/dashboard-stats.ts](lib/dashboard-stats.ts)
  (fonctions pures, `reference` date injectable).

---

## 10. Décisions de design (le « pourquoi »)

| Décision | Raison |
|---|---|
| **Palette violette** (`brand`) | Reprise des maquettes de référence fournies (type Ecomic / Invoicer) : thème clair, cartes arrondies, ombres douces, sidebar à icônes, badges pills. |
| **Francs en entiers** | Le CDF est manipulé sans sous-unité. Tout est en entiers, arrondi au franc. Affichage `Intl.NumberFormat("fr-FR")` + `" FC"`. |
| **TVA 16 %, arrondi par ligne** | Taux standard RDC. L'arrondi par ligne (puis somme) évite les écarts d'1 franc entre l'affichage des lignes et le total. Le taux est stocké **par facture** (modifiable via Paramètres). |
| **Numérotation `PRÉFIXE-ANNÉE-SÉQ`** | Format lisible et classable, séquence annuelle. Calculée depuis le max existant (pas de compteur séparé à désynchroniser). |
| **Statut `en_retard` manuel** | Pas de transition automatique à l'échéance pour l'instant : ça viendra avec un cron Supabase. En attendant, l'utilisateur change le statut à la main. |
| **Graphiques SVG faits main** | Pas de dépendance `recharts`/`d3` (poids, surface d'API). Un `<svg viewBox>` donne une mise à l'échelle fluide gratuite et un contrôle total ; l'accessibilité passe par `role="img"` + `aria-label` énumérant les valeurs. |
| **Store local en forme de « repository »** (`useData()`) | L'interface du Context préfigure une API serveur. La bascule Supabase = **remplacer l'implémentation interne**, sans réécrire les vues. |
| **Dashboard rendu côté client** | On **ne peut pas** faire de RSC à partir de `localStorage`. C'est le bon choix pour la couche de données actuelle, pas de la dette. `dashboard/layout.tsx` porte le `metadata` (pattern Next.js pour page cliente). |
| **`localStorage` comme base** | Permet de développer et valider toute l'UX sans backend. Clé versionnée (`…v1`). Sera remplacé, pas migré. |
| **Français partout** | Public cible francophone (RDC). UI, libellés, messages d'erreur, commentaires de code. |
| **Identité RDC subtile** | Positionnement Kinshasa/RDC dans le copy, les exemples, la devise ; jamais de design « africain » caricatural (pas de drapeaux partout, pas de motifs clichés). 🇨🇩 réservé au footer. |
| **`nav.ts` data-driven** | Ajouter une entrée de menu ne doit pas demander de toucher au JSX de la sidebar. |

---

## 11. Dette technique connue & plan actif

Un audit + une contre-expertise ont été réalisés. **Ne pas ré-auditer ; suivre le
plan ci-dessous.**

### État de la dette listée précédemment (vérifiée à jour — 2026-09-21)

La plupart des points ci-dessous sont désormais **résolus**. Statut vérifié
ligne par ligne plutôt que réaudité en bloc :

| ID | Problème | État |
|---|---|---|
| BUILD-01 | `npm run typecheck` échoue sur checkout propre (`tsconfig` inclut `.next/types/**`) | **Pas vraiment corrigeable** : `next lint` réinjecte automatiquement cette entrée dans `tsconfig.json` dès qu'il ne l'y trouve pas (comportement natif de `next lint`, pas un oubli). Sur un checkout propre, lancer `npm run dev` (ou `build`) **une première fois** avant `npm run typecheck` — `.next/types` doit exister. Ne pas retirer l'entrée manuellement, elle revient au prochain `npm run lint`. |
| — | Aucun test | **Toujours vrai.** Vitest + Playwright pas encore ajoutés. |
| A-01 | Débordement horizontal à 1280 px (légende du donut) | **Résolu** (`min-w-0`/`truncate`/`shrink-0` déjà en place dans `status-donut.tsx`). |
| DS-01 | Couleurs/libellés de statut dupliqués | **Partiellement résolu.** `lib/invoice-status.ts` centralise labels/icônes/transitions, mais `status-badge.tsx` (classes Tailwind) et `status-donut.tsx` (hex SVG) gardent chacun leur propre table de couleurs — nécessaire techniquement (Tailwind vs SVG `stroke`), mais toujours 2 sources à synchroniser à la main si une couleur de statut change. |
| DS-02 | `text-slate-400` sur du texte lisible | **Partiellement résolu.** Corrigé sur le texte d'aide des formulaires (`Field`). Reste par endroits (emails secondaires dans les tableaux, labels de section en petites capitales) — bas risque, non traité par manque de temps de vérification visuelle. |
| A11Y-01 | Lignes de tableau non navigables au clavier | **Résolu** : le numéro de facture est un `<Link>` dans `/invoices`, le tableau du dashboard et la fiche client ; le nom du client aussi. |
| — | Puces de tendance factices | **Résolu** (retirées), puis **réintroduites en 2026-09-21 avec de vraies données** (`TrendBadge`, comparaison mois vs mois précédent réellement calculée dans `lib/dashboard-stats.ts`) — ce n'est plus la même dette. |

### Itération 2 — accessibilité des primitives : **faite le 2026-09-21**

- ✅ `Field`/`Input`/`Select`/`Textarea` : `aria-invalid` + `aria-describedby`.
- ✅ `Modal` : focus à l'ouverture/fermeture + `aria-labelledby`.
- ✅ `DropdownMenu` : `role="menu"`/`menuitem` retirés, focus 1er item / retour trigger.
- ✅ `globals.css` : `prefers-reduced-motion` déjà présent.
- ✅ Skip-link + `<main id="main">` (`AppShell`) ; `scope="col"` sur les `<th>` (`Table`).
- ✅ Les 3 formulaires (facture, client, entreprise) sont dans de vrais `<form onSubmit>` — attention en cas de nouvel ajout de bouton dans ces formulaires : tout bouton non-submit doit garder `type="button"` explicite (piège HTML sinon).
- Reste à faire : Topbar — `aria-label` sur la recherche (déjà présent) ; drawer mobile Échap + focus (pas vérifié).

### À NE PAS faire maintenant (reporté à la migration Supabase, ou non justifié)

- ~~Toucher à `data-provider.tsx` / `localStorage`~~ **Obsolète : la migration Supabase a eu lieu.** `data-provider.tsx` est maintenant le repository (Supabase + RLS), `supabase/migrations/*.sql` versionne le schéma. Ce fichier reste sensible (toute la couche données passe par lui) : le modifier avec précaution, mais l'interdiction totale ne s'applique plus.
- Convertir le dashboard en RSC ; créer un `loading.tsx` pour le dashboard (ne résout rien tant qu'il n'y a pas de fetch serveur).
- Créer une couche de **tokens Tailwind sémantiques** (`success/warning/…`), un dossier `lib/design/`, un composant `Sheet`, un hook `useFocusTrap`, un système de roving-tabindex.
- Extraire `useInvoiceForm` de `invoice-form.tsx`.
- Corriger le bug de fuseau horaire de `formatDate` (le public est UTC+0 — à traiter avec les tests de dates).
- Piège de Tab strict dans `Modal` ; portail du `DropdownMenu` (seulement si un menu de dernière ligne est visiblement rogné).
- Optimisations de performance (contexte à sélecteurs, mémo) tant qu'aucun profil ne le justifie.
- CI GitHub Actions, Prettier, plugins ESLint supplémentaires (Itération 4).

---

## 12. Instructions pour un futur modèle IA

**Avant de coder quoi que ce soit :**

1. **Lire ce fichier en entier.** Il est la source de vérité du produit, de
   l'architecture et des décisions.
2. Respecter le **Design System (§6–8)** : réutiliser `components/ui/*` ; si un
   composant manque, en créer un **générique** (tous ses états + responsive) puis
   l'utiliser. Jamais de style local à une page.
3. Écrire l'UI, les libellés et les commentaires **en français**.

**Règles non négociables :**

- **Données :** passer par `useData()`. **Ne jamais** modifier
  `components/providers/data-provider.tsx` ni la forme de `localStorage` avant la
  migration Supabase.
- **Formatage :** toujours `formatFCFA` / `formatDate` / `<StatusBadge>` /
  `<Avatar>`. Jamais de formatage inline.
- **Calculs :** uniquement `lib/invoice-calc.ts`. Les totaux d'une facture sont
  **figés** — ne pas les recalculer à l'affichage.
- **Stats :** uniquement `lib/dashboard-stats.ts`.
- **Responsive :** après toute modif d'écran, vérifier `scrollWidth ===
  clientWidth` à 360 / 768 / 1024 / **1280** / 1440 / 1920 px.
- **Accessibilité :** tout `<input>` a un nom accessible ; les erreurs sont
  reliées au champ ; toute interaction est possible au clavier ; `type="button"`
  sur les boutons non-`submit`.
- **Ne pas** lancer les Itérations Supabase/RSC/auth en avance (voir §11).

**Terminer une tâche =** `npm run build && npm run lint && npm run typecheck`
verts (et `npm test` quand la suite existera), **plus** une vérification visuelle
de l'écran touché.

**Environnement de vérification (cette machine) :**

- Chrome headless disponible : `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
  — utilisable via le protocole CDP (`--headless=new --remote-debugging-port=…`)
  pour captures d'écran, sonde de débordement horizontal et sonde de contraste.
- Répertoire scratchpad fourni dans le prompt système pour les scripts jetables.
- **Piège 1 :** ne jamais lancer `next build` pendant qu'un `next dev`/`next start`
  tourne → corrompt `.next` (tuer tout process `next` d'abord).
- **Piège 2 :** `localhost` peut résoudre en `::1` ; utiliser `127.0.0.1` pour
  Chrome headless et Playwright.

**Périmètre :** ne modifier que les fichiers nécessaires à la tâche demandée.
En cas de doute sur l'ampleur, s'arrêter et demander.

---

## 13. Commandes

```bash
npm run dev        # http://localhost:3000  (/ → /dashboard)
npm run build      # build de production (lance aussi le typecheck Next + le lint)
npm run start      # sert le build (npm run start -- -p 3100 pour un autre port)
npm run lint       # eslint (next/core-web-vitals)
npm run typecheck  # tsc --noEmit
# (à venir) npm test           # Vitest — logique lib/*
# (à venir) npm run test:e2e   # Playwright — smoke + responsive
```

---

## 14. État d'avancement / roadmap

*(Section corrigée le 2026-09-21 — elle décrivait encore un état pré-Supabase
alors que la bascule a eu lieu depuis. Statut ci-dessous vérifié sur le code réel.)*

- [x] Scaffold Next.js 14 + Tailwind + tokens
- [x] Shell (sidebar + topbar + drawer mobile) + navigation data-driven (Dashboard, **Clients**, Factures, Paramètres, Aide)
- [x] Design System : primitives génériques dans `components/ui/`
- [x] **Supabase** : schéma + RLS multi-tenant (`supabase/migrations/`), `data-provider.tsx` = repository branché dessus (plus de `localStorage`)
- [x] **Authentification** Supabase complète : inscription, connexion, vérification email, mot de passe oublié/reset, suppression de compte, middleware de session
- [x] i18n FR (défaut) / EN sur toute l'app + la landing
- [x] Dashboard : KPI trésorerie (CA facturé / Encaissé / À encaisser / En retard) avec tendance réelle, zone « À faire », graphique facturé vs encaissé (période sélectionnable), donut, dernières factures
- [x] Factures : liste (filtres + recherche + `?status=`/`?q=`), création, détail, édition, statut (action principale + menu secondaire), indicateur « en retard depuis N jours », suppression
- [x] Clients : liste, **fiche détail** (`/clients/[id]`, factures du client, raccourci nouvelle facture), ajout/édition (modal), suppression (bloquée si factures liées)
- [x] Paramètres entreprise + profil (nom, photo) + Aide & support (tutoriel rejouable, ressources marquées "bientôt disponible")
- [x] Export PDF de facture (`@react-pdf/renderer`), envoi par email (Resend, si configuré)
- [x] Landing page publique + pages `/terms` et `/privacy` (modèles génériques, à faire relire par un juriste)
- [x] Itération 2 accessibilité (voir §11) : formulaires en `<form>`, focus modale/dropdown, skip-link, `aria-invalid`/`aria-describedby`
- [ ] Tests (Vitest / Playwright) — **toujours rien**, seule dette "MUST FIX" restante de la liste d'origine
- [ ] Intégrations de paiement (Mobile Money…), relances automatiques, multi-utilisateurs par entreprise
- [ ] CI GitHub Actions, Prettier, plugins ESLint supplémentaires

### Backlog produit non engagé (évoqué le 2026-09-21, pas construit)

Une proposition de refonte globale a suggéré d'ajouter des modules **Devis,
Avoirs, Paiements (suivi dédié), Relances, Rapports**. Volontairement **pas**
implémentés dans la foulée : ce sont de nouvelles fonctionnalités avec des
règles métier à définir (numérotation d'un avoir ? conversion devis→facture ?
canal des relances ?), pas des corrections du dashboard existant — les
construire sans réponses à ces questions aurait produit des écrans à moitié
finis. À cadrer avec l'utilisateur avant toute implémentation.
