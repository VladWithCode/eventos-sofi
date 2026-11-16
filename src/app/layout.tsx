import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Figtree, Pinyon_Script } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const script = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Eventos Sofi — Organización y decoración de eventos",
    template: "%s · Eventos Sofi",
  },
  description:
    "Organización, decoración, banquetes y renta de mobiliario en Durango. Tu evento de principio a fin.",
  // Meta Business domain verification; the value comes from Business Settings.
  ...(process.env.META_DOMAIN_VERIFICATION
    ? { verification: { other: { "facebook-domain-verification": process.env.META_DOMAIN_VERIFICATION } } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#f8f3ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${display.variable} ${sans.variable} ${script.variable} antialiased`}>
      <body className="min-h-dvh bg-paper text-ink">{children}</body>
    </html>
  );
}
