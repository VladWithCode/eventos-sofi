/**
 * Normalizes a Mexican phone number to "52" + 10 digits. Accepts "+52 55 1234 5678",
 * "5512345678", "0052…" and the legacy mobile prefix "521…". Returns null when the
 * input cannot be a Mexican number.
 */
export function normalizeMxPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 13 && digits.startsWith("521")) digits = `52${digits.slice(3)}`;
  if (digits.length === 12 && digits.startsWith("52")) return digits;
  if (digits.length === 10) return `52${digits}`;
  return null;
}

/** "526181091072" → "+52 618 109 1072". Anything else is returned unchanged. */
export function formatMxPhone(phone: string): string {
  const match = /^52(\d{3})(\d{3})(\d{4})$/.exec(phone);
  return match ? `+52 ${match[1]} ${match[2]} ${match[3]}` : phone;
}

export function whatsappLink(phone: string, text?: string): string {
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${phone}${query}`;
}
