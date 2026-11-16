import type { Metadata } from "next";
import { Suspense } from "react";
import { PasswordForm } from "@/components/admin/password-form";
import { SettingsForm } from "@/components/admin/settings-form";
import { PageSkeleton } from "@/components/admin/skeleton";
import { Card, CardTitle, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { readSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Ajustes" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Ajustes" description="Datos de contacto y del negocio que se muestran en el sitio." />
      <Suspense fallback={<PageSkeleton rows={6} />}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  const admin = await requireAdmin();
  return (
    <div className="flex flex-col gap-10">
      <SettingsForm settings={readSettings()} />
      <section aria-labelledby="password-title">
        <Card className="flex flex-col gap-4">
          <CardTitle id="password-title">Contraseña</CardTitle>
          <p className="text-[0.9rem] text-muted">
            Cuenta: <span className="font-semibold text-ink-soft">{admin.email}</span>. Al cambiarla, se cierra la sesión
            en tus otros dispositivos.
          </p>
          <PasswordForm />
        </Card>
      </section>
    </div>
  );
}
