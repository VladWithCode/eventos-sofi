"use server";

import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { deleteContact, setContactStatus } from "@/lib/data/contacts";
import { idFrom } from "@/lib/forms";
import { isContactStatus } from "@/lib/statuses";

export async function changeMessageStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  const status = formData.get("status");
  if (!id || !isContactStatus(status)) return;
  setContactStatus(id, status);
  refresh();
}

export async function removeMessage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  if (id) deleteContact(id);
  refresh();
}
