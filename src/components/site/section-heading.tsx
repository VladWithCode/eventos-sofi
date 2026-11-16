import { Reveal, RevealText } from "@/components/motion/reveal";
import { SparkIcon } from "./icons";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-[46rem] ${className ?? ""}`}>
      <Reveal y={14}>
        <p className={`eyebrow flex items-center gap-3 text-gold-deep ${centered ? "justify-center" : ""}`}>
          <SparkIcon className="size-3.5" />
          {eyebrow}
        </p>
      </Reveal>
      <RevealText text={title} className="display-xl mt-5" delay={0.05} />
      {description ? (
        <Reveal delay={0.2} y={18}>
          <p className={`lede mt-6 text-ink-soft ${centered ? "mx-auto" : ""} max-w-[36rem]`}>{description}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
