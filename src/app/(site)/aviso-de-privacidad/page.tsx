import type { Metadata } from "next";
import type { ReactNode } from "react";
import { formatPhone } from "@/components/site/format";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: "Cómo Eventos Sofi recaba, usa y protege tus datos personales.",
  alternates: { canonical: "/aviso-de-privacidad" },
};

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="display-md">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-ink-soft">{children}</div>
    </section>
  );
}

/*
 * Draft notice following the structure required by Mexico's LFPDPPP
 * (responsable, datos, finalidades, transferencias, derechos ARCO, cambios).
 * The owner must review it with legal counsel before publishing.
 */
export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const location = [settings.address, settings.city].filter(Boolean).join(", ");

  return (
    <article className="shell max-w-[52rem] pt-36 pb-24 sm:pt-44">
      <p className="eyebrow text-gold-deep">Legal</p>
      <h1 className="display-xl mt-5">Aviso de privacidad</h1>

      <Block title="Responsable de tus datos">
        <p>
          {settings.businessName}, con domicilio en {location}, México, es responsable del uso y la protección de los
          datos personales que nos compartes a través de este sitio.
        </p>
      </Block>

      <Block title="Datos que recabamos">
        <p>
          Cuando solicitas una cotización o nos envías un mensaje recabamos tu nombre, teléfono o WhatsApp, correo
          electrónico (si lo proporcionas) y los datos de tu evento: tipo, fecha, número de invitados, lugar y
          comentarios. No solicitamos datos personales sensibles.
        </p>
        <p>
          El sitio también registra información técnica de tu visita (por ejemplo, la página de origen y los
          identificadores de campaña publicitaria) mediante cookies y tecnologías similares.
        </p>
      </Block>

      <Block title="Para qué los usamos">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>Contactarte y preparar la cotización que solicitaste.</li>
          <li>Planear, coordinar y dar seguimiento a tu evento.</li>
          <li>Medir el resultado de nuestra publicidad y mejorar nuestro servicio.</li>
        </ul>
      </Block>

      <Block title="Con quién los compartimos">
        <p>
          Utilizamos herramientas de medición publicitaria de Meta Platforms (Facebook e Instagram). Para ello podemos
          compartir con Meta datos de contacto en forma cifrada (hash) e información técnica de tu visita, con el fin
          de medir nuestras campañas. No vendemos tus datos ni los compartimos con terceros para otros fines, salvo
          obligación legal.
        </p>
      </Block>

      <Block title="Tus derechos (ARCO)">
        <p>
          Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su uso, así como revocar tu
          consentimiento, escribiéndonos
          {settings.email ? (
            <>
              {" "}
              a{" "}
              <a href={`mailto:${settings.email}`} className="font-semibold text-ink underline underline-offset-2">
                {settings.email}
              </a>
            </>
          ) : null}{" "}
          o por WhatsApp al {formatPhone(settings.whatsapp)}. Indica tu nombre, el derecho que deseas ejercer y un
          medio para responderte.
        </p>
      </Block>

      <Block title="Cambios a este aviso">
        <p>Cualquier modificación a este aviso se publicará en esta misma página.</p>
      </Block>
    </article>
  );
}
