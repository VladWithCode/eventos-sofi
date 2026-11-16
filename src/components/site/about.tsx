import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import type { SiteSettings } from "@/lib/types";
import { SparkIcon } from "./icons";
import { Manifesto } from "./manifesto";

type AboutProps = { settings: SiteSettings; serviceCount: number };

export function About({ settings, serviceCount }: AboutProps) {
  const years = settings.yearsExperience;
  const stats = [
    { value: years, suffix: "", label: "años creando celebraciones" },
    { value: serviceCount, suffix: "", label: "servicios en un solo lugar" },
    // Zero means the owner has not set a figure yet.
    ...(settings.eventsCompleted > 0
      ? [{ value: settings.eventsCompleted, suffix: "+", label: "eventos realizados" }]
      : []),
  ];

  return (
    <section id="nosotros" className="shell py-24 sm:py-32 lg:py-40">
      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-3" y={14}>
          <p className="eyebrow flex items-center gap-3 text-gold-deep">
            <SparkIcon className="size-3.5" />
            Nuestra historia
          </p>
        </Reveal>
        <div className="lg:col-span-9">
          <Manifesto
            text={`Desde hace ${years} años diseñamos, decoramos y coordinamos celebraciones en Durango. Tú disfrutas a tu gente; nosotros cuidamos cada detalle, de la primera idea al último brindis.`}
            emphasis={[String(years), "años", "detalle"]}
          />

          <dl className="mt-14 grid gap-x-10 gap-y-9 border-t border-line pt-10 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.08}>
                <dd className="font-display text-[clamp(3.5rem,7vw,5.5rem)] leading-[0.9] font-medium tracking-[-0.04em]">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </dd>
                <dt className="mt-3 max-w-[14rem] text-[0.95rem] text-muted">{stat.label}</dt>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
