import { cacheLife } from "next/cache";
import Link from "next/link";
import { Parallax } from "@/components/motion/parallax";
import type { SiteSettings } from "@/lib/types";
import { FacebookIcon, InstagramIcon } from "./icons";
import { ContactLink } from "./links";

type NavLink = { href: string; label: string };

/** Reading the clock is request-time work, so the year is cached for a day. */
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter({ settings, links }: { settings: SiteSettings; links: NavLink[] }) {
  const year = await currentYear();

  return (
    <footer className="overflow-clip border-t border-line bg-sand/60">
      <div className="shell pt-16 sm:pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-[1.75rem] leading-tight font-medium tracking-[-0.015em] text-balance">
              Eventos con el corazón, de principio a fin.
            </p>
            <p className="mt-4 max-w-sm text-[0.95rem] text-muted">
              Organización, decoración, banquetes y renta de mobiliario en {settings.city}
            </p>
          </div>

          <nav aria-label="Pie de página" className="md:col-span-3 md:col-start-7">
            <p className="eyebrow text-[0.68rem] text-muted">Explora</p>
            <ul className="mt-4 flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${link.href}`}
                    className="inline-flex min-h-10 items-center text-[1rem] font-medium text-ink-soft transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#cotizar"
                  className="inline-flex min-h-10 items-center text-[1rem] font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  Cotizar evento
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="eyebrow text-[0.68rem] text-muted">Síguenos</p>
            <div className="mt-4 flex gap-2.5">
              {settings.instagramUrl ? (
                <ContactLink
                  method="instagram"
                  href={settings.instagramUrl}
                  aria-label="Instagram de Eventos Sofi"
                  className="grid size-12 place-items-center rounded-full border border-ink/15 bg-surface transition-[transform,border-color] duration-200 ease-out hover:border-ink active:scale-[0.94]"
                >
                  <InstagramIcon className="size-5" />
                </ContactLink>
              ) : null}
              {settings.facebookUrl ? (
                <ContactLink
                  method="facebook"
                  href={settings.facebookUrl}
                  aria-label="Facebook de Eventos Sofi"
                  className="grid size-12 place-items-center rounded-full border border-ink/15 bg-surface transition-[transform,border-color] duration-200 ease-out hover:border-ink active:scale-[0.94]"
                >
                  <FacebookIcon className="size-5" />
                </ContactLink>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-line py-6 text-[0.875rem] text-muted">
          <p>
            © {year} {settings.businessName}. Todos los derechos reservados.
          </p>
          <Link href="/aviso-de-privacidad" className="font-medium underline-offset-4 hover:text-ink hover:underline">
            Aviso de privacidad
          </Link>
        </div>
      </div>

      {/* Oversized wordmark rising out of the page edge. */}
      <Parallax distance={-40} className="pointer-events-none mt-10 -mb-[0.34em] select-none">
        <p
          aria-hidden
          className="text-center font-script text-[clamp(9rem,36vw,28rem)] leading-none text-ink/[0.07]"
        >
          Sofi
        </p>
      </Parallax>
    </footer>
  );
}
