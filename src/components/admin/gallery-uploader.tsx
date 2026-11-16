"use client";

import { ImagePlus } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { uploadGalleryPhoto } from "@/app/actions/admin/gallery";
import { EVENT_TYPES } from "@/lib/event-types";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/upload-limits";
import { Button, Field, Notice, Select } from "./ui";


type Progress = { done: number; total: number } | null;

/** Uploads the selected photos one request at a time, so each stays under the body size limit. */
export function GalleryUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<Progress>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState(0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const eventType = String(new FormData(form).get("eventType") ?? "");
    const files = Array.from(inputRef.current?.files ?? []);
    if (files.length === 0) {
      setErrors(["Elige al menos una foto."]);
      return;
    }

    const failed: string[] = [];
    let ok = 0;
    setErrors([]);
    setUploaded(0);
    setProgress({ done: 0, total: files.length });
    for (const [i, file] of files.entries()) {
      if (file.size > MAX_UPLOAD_BYTES) {
        failed.push(`${file.name}: pesa más de 12 MB.`);
      } else {
        const data = new FormData();
        data.set("file", file);
        data.set("eventType", eventType);
        try {
          const result = await uploadGalleryPhoto(data);
          if (result.ok) ok++;
          else failed.push(`${file.name}: ${result.message ?? "no se pudo subir."}`);
        } catch {
          failed.push(`${file.name}: se perdió la conexión.`);
        }
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setProgress(null);
    setUploaded(ok);
    setErrors(failed);
    form.reset();
  }

  const busy = progress !== null;
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de evento" htmlFor="upload-eventType" hint="Puedes cambiarlo después en cada foto.">
          <Select id="upload-eventType" name="eventType" defaultValue="xv-anos" aria-describedby="upload-eventType-hint">
            {EVENT_TYPES.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fotos" htmlFor="upload-files" hint="JPG, PNG, WebP, AVIF o HEIC. Máximo 12 MB cada una.">
          <input
            ref={inputRef}
            id="upload-files"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            multiple
            disabled={busy}
            aria-describedby="upload-files-hint"
            className="min-h-11 w-full cursor-pointer rounded-[0.875rem] border border-dashed border-line bg-surface px-3 py-2 text-[0.9rem] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-sand file:px-3 file:py-1.5 file:font-semibold file:text-ink"
          />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy} aria-disabled={busy}>
          <ImagePlus aria-hidden className="size-4" />
          {busy ? `Subiendo ${Math.min(progress.done + 1, progress.total)} de ${progress.total}…` : "Subir fotos"}
        </Button>
        {busy ? (
          <progress
            value={progress.done}
            max={progress.total}
            aria-label="Progreso de subida"
            className="h-2 w-40 overflow-hidden rounded-full accent-blue-deep"
          />
        ) : null}
      </div>
      <div aria-live="polite" className="flex flex-col gap-2">
        {uploaded > 0 ? (
          <Notice tone="ok">
            {uploaded === 1 ? "Se subió 1 foto." : `Se subieron ${uploaded} fotos.`} Revisa su descripción abajo.
          </Notice>
        ) : null}
        {errors.length > 0 ? (
          <Notice tone="danger">
            <ul className="list-disc pl-4">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Notice>
        ) : null}
      </div>
    </form>
  );
}
