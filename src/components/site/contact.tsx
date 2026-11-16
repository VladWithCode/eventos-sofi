import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal, RevealText } from "@/components/motion/reveal";
import type { SiteSettings } from "@/lib/types";
import { ContactForm } from "./contact-form";
import { formatPhone } from "./format";
import { FacebookIcon, InstagramIcon, SparkIcon, WhatsAppIcon } from "./icons";
import { ContactLink } from "./links";

type Channel = { key: string; link: ReactNode };

function row(icon: ReactNode, label: string, value: string) {
  return (
    <>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-soft transition-transform duration-300 ease-(--ease-out-expo) group-hover:scale-110">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.8rem] text-muted">{label}</span>
        <span className="block leading-snug font-semibold [overflow-wrap:anywhere]">{value}</span>
      </span>
    </>
  );
}

const rowClass = "group flex min-h-14 items-center gap-4 rounded-2xl py-1.5";

export function Contact({ settings, whatsappUrl }: { settings: SiteSettings; whatsappUrl: string }) {
  const channels: Channel[] = [
    {
      key: "whatsapp",
      link: (
        <ContactLink method="whatsapp" href={whatsappUrl} className={rowClass}>
          {row(<WhatsAppIcon className="size-5 text-whatsapp" />, "WhatsApp", formatPhone(settings.whatsapp))}
        </ContactLink>
      ),
    },
    {
      key: "phone",
      link: (
        <ContactLink method="phone" href={`tel:+${settings.phone}`} className={rowClass}>
          {row(<Phone className="size-5" />, "Teléfono", formatPhone(settings.phone))}
        </ContactLink>
      ),
    },
    ...(settings.email
      ? [
          {
            key: "email",
            link: (
              <a href={`mailto:${settings.email}`} className={rowClass}>
                {row(<Mail className="size-5" />, "Correo", settings.email)}
              </a>
            ),
          },
        ]
      : []),
    ...(settings.instagramUrl
      ? [
          {
            key: "instagram",
            link: (
              <ContactLink method="instagram" href={settings.instagramUrl} className={rowClass}>
                {row(<InstagramIcon className="size-5" />, "Instagram", "Síguenos")}
              </ContactLink>
            ),
          },
        ]
      : []),
    ...(settings.facebookUrl
      ? [
          {
            key: "facebook",
            link: (
              <ContactLink method="facebook" href={settings.facebookUrl} className={rowClass}>
                {row(<FacebookIcon className="size-5" />, "Facebook", settings.businessName)}
              </ContactLink>
            ),
          },
        ]
      : []),
  ];

  const location = [settings.address, settings.city].filter(Boolean).join(", ");

  return (
    <section id="contacto" className="shell pb-24 sm:pb-32">
      <div className="grain relative overflow-clip rounded-[2.25rem] bg-blue-wash px-6 py-14 sm:px-12 sm:py-20 lg:rounded-[3rem] lg:px-20">
        <div
          aria-hidden
          className="absolute -top-32 -right-24 size-[30rem] rounded-full bg-gold-wash opacity-80 blur-3xl"
        />
        <div className="relative grid gap-x-16 gap-y-12 lg:grid-cols-2">
          <div>
            <Reveal y={14}>
              <p className="eyebrow flex items-center gap-3 text-blue-deep">
                <SparkIcon className="size-3.5" />
                Contacto
              </p>
            </Reveal>
            <RevealText text="¿Tienes una duda? Platiquemos." className="display-xl mt-5" />
            <Reveal delay={0.15}>
              <p className="lede mt-6 max-w-[30rem] text-ink-soft">
                Escríbenos por el medio que prefieras. Con gusto te orientamos, sin compromiso.
              </p>
            </Reveal>

            <ul className="mt-9 grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {channels.map((channel, index) => (
                <Reveal as="li" key={channel.key} delay={0.1 + index * 0.05} y={16}>
                  {channel.link}
                </Reveal>
              ))}
              {location ? (
                <Reveal as="li" delay={0.4} y={16} className={rowClass}>
                  {row(<MapPin className="size-5" />, "Ubicación", location)}
                </Reveal>
              ) : null}
              {settings.hours ? (
                <Reveal as="li" delay={0.45} y={16} className={rowClass}>
                  {row(<Clock className="size-5" />, "Horario", settings.hours)}
                </Reveal>
              ) : null}
            </ul>
          </div>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
