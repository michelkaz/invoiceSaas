import { Suspense } from "react";
import type { Metadata } from "next";
import { getServerT } from "@/lib/i18n/server";
import { VerifyEmailView } from "@/components/auth/verify-email-view";

export function generateMetadata(): Metadata {
  return { title: `Facturi — ${getServerT()("verify.title")}` };
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailView />
    </Suspense>
  );
}
