"use client";

import {
  CalendarHeart,
  CircleHelp,
  Ellipsis,
  House,
  Images,
  MessageCircle,
  Quote,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";

type NavKey = "inicio" | "reservas" | "mensajes" | "galeria" | "servicios" | "testimonios" | "preguntas" | "ajustes";
type NavItem = { key: NavKey; href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { key: "inicio", href: "/admin", label: "Inicio", icon: House },
  { key: "reservas", href: "/admin/reservas", label: "Reservas", icon: CalendarHeart },
  { key: "mensajes", href: "/admin/mensajes", label: "Mensajes", icon: MessageCircle },
  { key: "galeria", href: "/admin/galeria", label: "Galería", icon: Images },
  { key: "servicios", href: "/admin/servicios", label: "Servicios", icon: Sparkles },
  { key: "testimonios", href: "/admin/testimonios", label: "Testimonios", icon: Quote },
  { key: "preguntas", href: "/admin/preguntas", label: "Preguntas", icon: CircleHelp },
  { key: "ajustes", href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

const TAB_KEYS: NavKey[] = ["inicio", "reservas", "mensajes", "galeria"];
const TABS = NAV.filter((item) => TAB_KEYS.includes(item.key));
const MORE = NAV.filter((item) => !TAB_KEYS.includes(item.key));

export type NavBadges = Partial<Record<NavKey, ReactNode>>;

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

// Each nav has a hook-free variant for the Suspense fallback: usePathname()
// is request data on dynamic routes, so it cannot be part of the static shell.

export function SidebarNav({ badges }: { badges: NavBadges }) {
  return <SidebarNavList badges={badges} pathname={usePathname()} />;
}

export function SidebarNavList({ badges, pathname }: { badges: NavBadges; pathname: string }) {
  return (
    <nav aria-label="Secciones del panel">
      <ul className="flex flex-col gap-1">
        {NAV.map(({ key, href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex min-h-11 items-center gap-3 rounded-full px-4 text-[0.95rem] font-semibold transition-colors " +
                  (active ? "bg-ink text-paper" : "text-ink-soft hover:bg-sand")
                }
              >
                <Icon aria-hidden className="size-[1.15rem] shrink-0" />
                <span className="flex-1">{label}</span>
                {badges[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileTabBar(props: { badges: NavBadges; more: ReactNode }) {
  return <MobileTabBarList {...props} pathname={usePathname()} />;
}

export function MobileTabBarList({ badges, more, pathname }: { badges: NavBadges; more: ReactNode; pathname: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const close = () => detailsRef.current?.removeAttribute("open");
  const moreActive = MORE.some((item) => isActive(pathname, item.href));

  const tabClass = (active: boolean) =>
    "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-[1.1rem] text-[0.7rem] font-semibold transition-colors " +
    (active ? "bg-ink text-paper" : "text-ink-soft hover:bg-sand/70");

  return (
    <nav
      aria-label="Secciones del panel"
      className="glass fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 rounded-[1.5rem] p-1.5 lg:hidden"
    >
      <ul className="flex gap-1">
        {TABS.map(({ key, href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={key} className="flex flex-1">
              <Link href={href} aria-current={active ? "page" : undefined} className={tabClass(active)} onClick={close}>
                <Icon aria-hidden className="size-5" />
                {label}
                {badges[key] ? <span className="absolute top-1 right-[calc(50%-1.6rem)]">{badges[key]}</span> : null}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <details ref={detailsRef} className="group flex flex-1">
            <summary className={tabClass(moreActive) + " list-none [&::-webkit-details-marker]:hidden"}>
              <Ellipsis aria-hidden className="size-5" />
              Más
            </summary>
            <div className="absolute inset-x-0 bottom-[calc(100%+0.5rem)] rounded-[1.25rem] border border-line bg-surface p-2 shadow-lift">
              <ul className="flex flex-col gap-1">
                {MORE.map(({ key, href, label, icon: Icon }) => {
                  const active = isActive(pathname, href);
                  return (
                    <li key={key}>
                      <Link
                        href={href}
                        onClick={close}
                        aria-current={active ? "page" : undefined}
                        className={
                          "flex min-h-12 items-center gap-3 rounded-[0.9rem] px-4 font-semibold " +
                          (active ? "bg-ink text-paper" : "text-ink-soft hover:bg-sand")
                        }
                      >
                        <Icon aria-hidden className="size-5" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 border-t border-line px-2 pt-3 pb-1">{more}</div>
            </div>
          </details>
        </li>
      </ul>
    </nav>
  );
}
