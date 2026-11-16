import "server-only";
import { redirect } from "next/navigation";
import { getAdmin, type AdminUser } from "./session";

/**
 * The single authorization gate for the admin. Every admin page, server action
 * and route handler calls it; layouts are never trusted to have checked.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
