import { Parallax } from "@/components/motion/parallax";
import type { GalleryItem, SiteSettings } from "@/lib/types";
import { ArtFrame } from "./art";
import { BalloonGarland } from "./balloon-garland";
import { SparkIcon } from "./icons";
import { PrimaryCta, WhatsAppCta } from "./links";

type HeroProps = {
  settings: SiteSettings;
  /** Photos marked "Destacada" in the dashboard; artwork fills in when missing. */
  featured: GalleryItem[];
  whatsappUrl: string;
};

/*
 * Everything above the fold animates with CSS so the headline paints and
 * moves before any JavaScript has loaded (the page is an ad landing page).
 */
export function Hero({ settings, featured, whatsappUrl }: HeroProps) {
  const [main, second] = featured;
  const badgeText = `${settings.yearsExperience} años creando eventos inolvidables · `;

  return (
    <section className="grain relative isolate overflow-clip pt-28 pb-20 sm:pt-32 lg:pt-36 lg:pb-28">
      {/* Ambient light: one cool, one warm, as if from venue uplighting. */}
      <div
        aria-hidden
        className="absolute -top-40 -left-40 -z-10 size-[42rem] rounded-full bg-blue-wash opacity-90 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute top-1/3 -right-52 -z-10 size-[44rem] rounded-full bg-gold-wash opacity-80 blur-3xl"
      />

      <div className="shell grid items-center gap-x-10 gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow flex animate-rise items-center gap-3 text-gold-deep">
            <SparkIcon className="size-3.5" />
            Organización y decoración · {settings.city}
          </p>

          <h1 className="mt-6">
            <span className="display-hero block animate-rise [animation-delay:90ms]">
              Creamos eventos
            </span>
            <span className="-mt-[0.06em] block animate-rise pl-[0.04em] font-script text-[clamp(4.2rem,13.5vw,9.25rem)] leading-[0.86] [animation-delay:220ms]">
              <span className="gold-foil inline-block animate-sheen px-[0.08em] pb-[0.18em]">
                inolvidables
              </span>
            </span>
          </h1>

          <p className="lede mt-6 max-w-[34rem] animate-rise text-ink-soft [animation-delay:340ms]">
            Diseño, decoración, banquete y mobiliario en un solo lugar. Nos encargamos de tu
            celebración de principio a fin, para que tú solo llegues a disfrutarla.
          </p>

          <div className="mt-9 flex animate-rise flex-wrap items-center gap-3 [animation-delay:440ms]">
            <PrimaryCta href="#cotizar">Cotiza tu evento</PrimaryCta>
            <WhatsAppCta href={whatsappUrl}>WhatsApp</WhatsAppCta>
          </div>

          <dl className="mt-12 hidden animate-rise flex-wrap sm:flex gap-x-10 gap-y-5 border-t border-line pt-7 [animation-delay:560ms]">
            <div>
              <dt className="eyebrow text-[0.68rem] text-muted">Experiencia</dt>
              <dd className="mt-1.5 font-display text-[1.7rem] leading-none font-semibold">
                {settings.yearsExperience} años
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-[0.68rem] text-muted">Celebramos</dt>
              <dd className="mt-1.5 font-display text-[1.7rem] leading-none font-semibold">
                XV, bodas y fiestas
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-[0.68rem] text-muted">Cobertura</dt>
              <dd className="mt-1.5 font-display text-[1.7rem] leading-none font-semibold">
                {settings.serviceArea}
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto w-[min(74vw,23rem)] lg:col-span-5 lg:w-full lg:max-w-[27rem]">
          <Parallax anchor="exit" distance={-70}>
            <div className="relative aspect-[300/420]">
              <ArtFrame
                image={main?.image ?? null}
                tone="blue"
                priority
                sizes="(min-width: 1024px) 27rem, 74vw"
                className="arch size-full animate-unveil shadow-lift [animation-delay:150ms]"
              />
              <BalloonGarland />
            </div>
          </Parallax>

          <Parallax anchor="exit" distance={-170} className="absolute -bottom-10 -left-[16%] w-[46%]">
            <div className="animate-rise [animation-delay:700ms]">
              <ArtFrame
                image={second?.image ?? null}
                tone="gold"
                sizes="(min-width: 1024px) 12rem, 34vw"
                className="arch aspect-[3/4] border-[6px] border-paper shadow-lift"
              />
            </div>
          </Parallax>

          <Parallax anchor="exit" distance={-120} className="absolute top-[38%] -right-[9%] w-[34%] max-w-[9.5rem]">
            <div className="glass relative grid aspect-square animate-rise place-items-center rounded-full [animation-delay:900ms]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow" aria-hidden>
                <defs>
                  <path id="hero-badge-ring" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
                </defs>
                <text className="fill-ink text-[8.4px] font-semibold tracking-[0.2em] uppercase">
                  <textPath href="#hero-badge-ring" textLength="230">
                    {badgeText}
                  </textPath>
                </text>
              </svg>
              <SparkIcon className="size-[26%] text-gold" />
            </div>
          </Parallax>
        </div>
      </div>
    </section>
  );
}
