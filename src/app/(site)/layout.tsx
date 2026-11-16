import { MetaPixel } from "@/components/meta/meta-pixel";
import { whatsappHref } from "@/components/site/format";
import { navLinks } from "@/components/site/nav-links";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { getGallery, getSiteSettings } from "@/lib/content";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, gallery] = await Promise.all([getSiteSettings(), getGallery()]);
  const whatsappUrl = whatsappHref(settings.whatsapp, settings.whatsappMessage);
  const links = navLinks({ hasGallery: gallery.length > 0 });

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
      >
        Saltar al contenido
      </a>
      <SiteNav links={links.map((link) => ({ ...link, href: `/${link.href}` }))} whatsappUrl={whatsappUrl} />
      <main id="contenido">{children}</main>
      <SiteFooter settings={settings} links={links} />
      <WhatsAppFab href={whatsappUrl} />
      <MetaPixel />
    </>
  );
}
