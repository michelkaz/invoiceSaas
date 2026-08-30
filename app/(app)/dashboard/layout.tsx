import type { Metadata } from "next";
import { getServerT } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: `${getServerT()("dashboard.title")} — Facturi` };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
