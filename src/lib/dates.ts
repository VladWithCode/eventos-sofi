export const TIME_ZONE = "America/Mexico_City";

/** Today's date in Mexico City as YYYY-MM-DD. */
export function todayInMexico(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

const eventDateFormat = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats an event date (YYYY-MM-DD, a calendar day with no time zone). */
export function formatEventDate(isoDate: string): string {
  return isValidIsoDate(isoDate) ? eventDateFormat.format(new Date(`${isoDate}T12:00:00Z`)) : isoDate;
}

const timestampFormat = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

/** Formats a stored UTC ISO timestamp in Mexico City time. */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : timestampFormat.format(d);
}

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

export function formatMoney(amount: number): string {
  return money.format(amount);
}
