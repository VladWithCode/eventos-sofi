export function whatsappHref(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** "52" + 10 digits → "618 109 1072" for display. */
export function formatPhone(number: string) {
  const local = number.replace(/^52/, "");
  return local.length === 10
    ? `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
    : number;
}
