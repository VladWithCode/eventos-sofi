"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { fakeVerify, hashPassword, verifyPassword } from "@/lib/auth/password";
import { endOtherSessions, endSession, startSession } from "@/lib/auth/session";
import { findPasswordHash, findUserByEmail, setPasswordHash } from "@/lib/data/users";
import { formFields, invalid } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestContext } from "@/lib/request";
import type { FormState } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().trim().min(1, { error: "Escribe tu correo." }).max(200),
  password: z.string().min(1, { error: "Escribe tu contraseña." }).max(200),
});

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(formFields(formData, ["email", "password"]));
  if (!parsed.success) return invalid(parsed.error, "Escribe tu correo y contraseña.");

  const { ip } = await getRequestContext();
  if (!rateLimit(`login:${ip}`, 8, 15 * 60_000)) {
    return { status: "error", message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }

  const failed: FormState = { status: "error", message: "Correo o contraseña incorrectos." };
  const user = findUserByEmail(parsed.data.email);
  if (!user) {
    await fakeVerify(parsed.data.password);
    return failed;
  }
  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) return failed;

  await startSession(user.id);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

const passwordSchema = z
  .object({
    current: z.string().min(1, { error: "Escribe tu contraseña actual." }).max(200),
    next: z
      .string()
      .min(10, { error: "Usa al menos 10 caracteres." })
      .max(200, { error: "La contraseña es demasiado larga." }),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], error: "Las contraseñas no coinciden." });

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = passwordSchema.safeParse(formFields(formData, ["current", "next", "confirm"]));
  if (!parsed.success) return invalid(parsed.error);

  const { ip } = await getRequestContext();
  if (!rateLimit(`password:${ip}`, 8, 15 * 60_000)) {
    return { status: "error", message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }

  const stored = findPasswordHash(admin.id);
  if (!stored || !(await verifyPassword(parsed.data.current, stored))) {
    return { status: "error", fieldErrors: { current: "La contraseña actual no es correcta." } };
  }

  setPasswordHash(admin.id, await hashPassword(parsed.data.next));
  await endOtherSessions(admin.id);
  return { status: "success", message: "Contraseña actualizada. Cerramos tu sesión en otros dispositivos." };
}
