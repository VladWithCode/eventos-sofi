import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Wordmark } from "@/components/admin/account";
import { LoginForm } from "@/components/admin/login-form";
import { Card, Notice } from "@/components/admin/ui";
import { getAdmin } from "@/lib/auth/session";
import { hasUsers } from "@/lib/data/users";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark />
        </div>
        <Card className="flex flex-col gap-5">
          <h1 className="font-display text-3xl font-semibold">Bienvenida</h1>
          <Suspense fallback={<div className="h-56" />}>
            <LoginBody />
          </Suspense>
        </Card>
      </div>
    </main>
  );
}

async function LoginBody() {
  // Reading the session makes this request-time, so the setup notice is never baked in at build.
  if (await getAdmin()) redirect("/admin");

  if (!hasUsers()) {
    return (
      <Notice tone="warn">
        Aún no hay una cuenta de administración. Define <code>ADMIN_EMAIL</code> y <code>ADMIN_PASSWORD</code> (mínimo
        10 caracteres) en las variables de entorno del servidor y reinícialo; la cuenta se crea al iniciar.
      </Notice>
    );
  }
  return <LoginForm />;
}
