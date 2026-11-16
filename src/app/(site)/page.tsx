import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { About } from "@/components/site/about";
import { BookingForm } from "@/components/site/booking-form";
import { Contact } from "@/components/site/contact";
import { EventMarquee } from "@/components/site/event-marquee";
import { FaqList } from "@/components/site/faq";
import { formatPhone, whatsappHref } from "@/components/site/format";
import { Gallery } from "@/components/site/gallery";
import { Hero } from "@/components/site/hero";
import { SparkIcon } from "@/components/site/icons";
import { ContactLink, PrimaryCta, WhatsAppCta } from "@/components/site/links";
import { ProcessTimeline } from "@/components/site/process";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceDeck } from "@/components/site/services";
import { Testimonials } from "@/components/site/testimonials";
import { getFaqs, getGallery, getServices, getSiteSettings, getTestimonials } from "@/lib/content";

const description =
  "Organización, decoración, banquetes y renta de mobiliario en Durango. XV años, bodas, fiestas infantiles y graduaciones de principio a fin. Cotiza tu evento hoy.";

export const metadata: Metadata = {
  title: { absolute: "Eventos Sofi — Creamos eventos inolvidables en Durango" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: "Eventos Sofi",
    title: "Eventos Sofi — Creamos eventos inolvidables",
    description,
  },
};

const PROMISES = [
  "Cotización a tu medida y sin compromiso.",
  "Decoración, banquete y mobiliario con un solo equipo.",
  "Te acompañamos desde la primera idea hasta el último detalle.",
];

export default async function HomePage() {
  const [settings, services, gallery, testimonials, faqs] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getGallery(),
    getTestimonials(),
    getFaqs(),
  ]);
  const whatsappUrl = whatsappHref(settings.whatsapp, settings.whatsappMessage);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const businessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.businessName,
    description,
    url: siteUrl,
    telephone: `+${settings.phone}`,
    ...(settings.email ? { email: settings.email } : {}),
    address: {
      "@type": "PostalAddress",
      ...(settings.address ? { streetAddress: settings.address } : {}),
      addressLocality: "Durango",
      addressRegion: "Durango",
      addressCountry: "MX",
    },
    areaServed: settings.serviceArea,
    sameAs: [settings.instagramUrl, settings.facebookUrl, settings.tiktokUrl].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escaping "<" keeps content edited in the dashboard from closing the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd).replace(/</g, "\\u003c") }}
      />

      <div id="top" />
      <Hero settings={settings} featured={gallery.filter((item) => item.featured)} whatsappUrl={whatsappUrl} />
      <EventMarquee />
      <About settings={settings} serviceCount={services.length} />

      {services.length > 0 ? (
        <section id="servicios" className="shell pb-24 sm:pb-32">
          <SectionHeading
            eyebrow="Servicios"
            title="Todo lo que tu evento necesita, en un solo lugar"
            description="Elige un servicio o deja todo en nuestras manos. Armamos la propuesta según tu idea, tu espacio y tu presupuesto."
          />
          <ServiceDeck services={services} />
        </section>
      ) : null}

      {gallery.length > 0 ? (
        <section id="galeria" className="shell pb-24 sm:pb-32">
          <SectionHeading
            eyebrow="Galería"
            title="Momentos que hemos creado"
            description="Cada montaje es distinto, porque cada celebración lo es."
          />
          <Gallery items={gallery} />
        </section>
      ) : null}

      <section id="proceso" className="grain relative bg-sand/70 py-24 sm:py-32">
        <div className="shell grid gap-x-16 gap-y-14 lg:grid-cols-2">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              eyebrow="Cómo trabajamos"
              title="Planear tu evento es más fácil de lo que imaginas"
              description="Cuatro pasos claros. En cada uno sabes qué sigue y qué necesitamos de ti."
            />
            <Reveal delay={0.25} className="mt-9">
              <PrimaryCta href="#cotizar">Empezar ahora</PrimaryCta>
            </Reveal>
          </div>
          <ProcessTimeline />
        </div>
      </section>

      {testimonials.length > 0 ? (
        <section id="opiniones" className="shell overflow-x-clip py-24 sm:py-32">
          <SectionHeading eyebrow="Opiniones" title="Lo que dicen quienes ya celebraron con nosotros" />
          <Testimonials testimonials={testimonials} />
        </section>
      ) : null}

      <section id="cotizar" className="shell scroll-mt-24 py-24 sm:py-32">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:pt-6">
            <SectionHeading
              eyebrow="Cotiza tu evento"
              title="Cuéntanos qué vas a celebrar"
              description="Déjanos los datos básicos y preparamos una propuesta para ti."
            />
            <ul className="mt-9 flex flex-col gap-3.5">
              {PROMISES.map((promise, index) => (
                <Reveal as="li" key={promise} delay={0.2 + index * 0.07} y={16} className="flex items-start gap-3 text-ink-soft">
                  <SparkIcon className="mt-[0.35em] size-3.5 shrink-0 text-gold" />
                  {promise}
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.45} className="mt-10 border-t border-line pt-8">
              <p className="text-[0.95rem] text-muted">¿Prefieres platicarlo directamente?</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                <WhatsAppCta href={whatsappUrl}>WhatsApp</WhatsAppCta>
                <ContactLink
                  method="phone"
                  href={`tel:+${settings.phone}`}
                  className="inline-flex min-h-11 items-center border-b border-ink/30 font-semibold transition-colors hover:border-ink"
                >
                  Llamar al {formatPhone(settings.phone)}
                </ContactLink>
              </div>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-7" delay={0.1}>
            <BookingForm whatsappUrl={whatsappUrl} />
          </Reveal>
        </div>
      </section>

      {faqs.length > 0 ? (
        <section id="preguntas" className="shell pb-24 sm:pb-32">
          <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow="Preguntas frecuentes" title="Resolvemos tus dudas" />
            </div>
            <div className="lg:col-span-8">
              <FaqList faqs={faqs} />
            </div>
          </div>
        </section>
      ) : null}

      <Contact settings={settings} whatsappUrl={whatsappUrl} />
    </>
  );
}
