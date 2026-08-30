import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  /** Clé i18n du libellé (résolue dans la sidebar). */
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  titleKey: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    titleKey: "nav.sectionMain",
    items: [
      { labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
      { labelKey: "nav.invoices", href: "/invoices", icon: FileText },
      { labelKey: "nav.clients", href: "/clients", icon: Users },
    ],
  },
  {
    titleKey: "nav.sectionConfig",
    items: [
      { labelKey: "nav.settings", href: "/settings", icon: Settings },
      { labelKey: "nav.help", href: "/help", icon: LifeBuoy },
    ],
  },
];
