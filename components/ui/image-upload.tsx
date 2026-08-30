"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAX_BYTES = 2 * 1024 * 1024; // 2 Mo
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

interface ImageUploadProps {
  /** URL publique actuelle (ou null). */
  value: string | null | undefined;
  /** Préfixe de nom de fichier : "logo" ou "avatar". */
  kind: "logo" | "avatar";
  /** Appelé avec la nouvelle URL publique (ou null si retirée). */
  onChange: (url: string | null) => void;
  /** Rendu de l'aperçu : rond (avatar) ou rectangle (logo). */
  shape?: "circle" | "square";
  label?: string;
  hint?: string;
}

export function ImageUpload({
  value,
  kind,
  onChange,
  shape = "square",
  label,
  hint,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError("Formats acceptés : PNG, JPG, WebP, SVG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Fichier trop lourd (2 Mo maximum).");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setError("Session expirée.");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("assets")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      setBusy(false);
      setError("Échec de l'envoi. Réessayez.");
      return;
    }

    const { data } = supabase.storage.from("assets").getPublicUrl(path);
    setBusy(false);
    onChange(`${data.publicUrl}?v=${Date.now()}`);
  };

  const previewShape =
    shape === "circle" ? "h-16 w-16 rounded-full" : "h-16 w-24 rounded-xl";

  return (
    <div>
      {label && (
        <p className="mb-1.5 block text-sm font-medium text-slate-700">{label}</p>
      )}
      <div className="flex items-center gap-4 rounded-xl border border-dashed border-slate-300 p-4">
        <span
          className={cn(
            "grid shrink-0 place-items-center overflow-hidden border border-slate-200 bg-slate-50 text-slate-400",
            previewShape,
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-contain"
            />
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={pick} disabled={busy}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {value ? "Changer" : "Téléverser"}
            </Button>
            {value && !busy && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600"
              >
                <X className="h-3.5 w-3.5" />
                Retirer
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {error ?? hint ?? "PNG, JPG, WebP ou SVG — 2 Mo max."}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
