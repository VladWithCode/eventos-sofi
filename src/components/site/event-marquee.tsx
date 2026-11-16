import { VelocityMarquee } from "@/components/motion/velocity-marquee";
import { SparkIcon } from "./icons";

const CELEBRATIONS = [
  "XV años",
  "Bodas",
  "Fiestas infantiles",
  "Graduaciones",
  "Bautizos",
  "Cumpleaños",
  "Eventos empresariales",
];

/** Ribbon of celebrations that speeds up and leans with the scroll. */
export function EventMarquee() {
  return (
    <section aria-label="Tipos de evento" className="border-y border-line bg-surface/60 py-7 sm:py-9">
      <VelocityMarquee>
        <ul className="flex items-center">
          {CELEBRATIONS.map((name, index) => (
            <li key={name} className="flex items-center">
              <span
                className={`px-6 font-display text-[clamp(2.4rem,6vw,4.75rem)] leading-none tracking-[-0.03em] sm:px-9 ${
                  index % 2 === 0 ? "font-medium text-ink" : "font-normal text-gold-deep italic"
                }`}
              >
                {name}
              </span>
              <SparkIcon className="size-5 shrink-0 text-blue sm:size-7" />
            </li>
          ))}
        </ul>
      </VelocityMarquee>
    </section>
  );
}
