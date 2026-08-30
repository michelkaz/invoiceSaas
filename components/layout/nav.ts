import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Menu",
    items: [
      { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
      { label: "Factures", href: "/invoices", icon: FileText },
      { label: "Clients", href: "/clients", icon: Users },
    ],
  },
  {
    title: "Configuration",
    items: [
      { label: "Paramètres", href: "/settings", icon: Settings },
      { label: "Aide & support", href: "/help", icon: LifeBuoy },
    ],
  },
];
