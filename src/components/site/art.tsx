import Image from "next/image";
import type { MediaImage } from "@/lib/types";

export type ArtTone = "blue" | "gold" | "sand";

const toneBackground: Record<ArtTone, string> = {
  blue: "bg-[linear-gradient(165deg,#dfe7eb_0%,#b9c7cf_55%,#8a9ba5_100%)]",
  gold: "bg-[linear-gradient(165deg,#f8eed9_0%,#ecd6a8_55%,#cfa862_100%)]",
  sand: "bg-[linear-gradient(165deg,#fbf6ee_0%,#efe3d0_55%,#dcc9ab_100%)]",
};

const toneStroke: Record<ArtTone, string> = {
  blue: "#ffffff",
  gold: "#ffffff",
  sand: "#be9550",
};

const ARCH_COUNT = 5;

/**
 * Brand artwork shown wherever a photo has not been uploaded yet: nested
 * arches receding like a decorated event backdrop.
 */
export function ArchArt({ tone = "blue" }: { tone?: ArtTone }) {
  return (
    <div aria-hidden className={`absolute inset-0 ${toneBackground[tone]}`}>
      <svg
        viewBox="0 0 300 400"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 size-full"
        fill="none"
      >
        {Array.from({ length: ARCH_COUNT }, (_, index) => {
          const inset = 34 + index * 24;
          const radius = 150 - inset;
          const shoulder = 196 + index * 16;
          return (
            <path
              key={index}
              d={`M ${inset} 400 V ${shoulder} a ${radius} ${radius} 0 0 1 ${radius * 2} 0 V 400`}
              stroke={toneStroke[tone]}
              strokeWidth={index === 0 ? 1.6 : 1}
              opacity={0.85 - index * 0.13}
            />
          );
        })}
        <path
          d="M150 268 l4.5 13.5 13.5 4.5 -13.5 4.5 -4.5 13.5 -4.5 -13.5 -13.5 -4.5 13.5 -4.5z"
          fill={toneStroke[tone]}
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

type ArtFrameProps = {
  image: MediaImage | null;
  tone?: ArtTone;
  /** `sizes` attribute for the responsive image. */
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** A photo when one exists, brand artwork otherwise. Parent sets the shape. */
export function ArtFrame({ image, tone = "blue", sizes, priority, className }: ArtFrameProps) {
  return (
    <div className={`relative isolate overflow-clip bg-sand ${className ?? ""}`}>
      {image ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={image.blurDataUrl ? "blur" : "empty"}
          blurDataURL={image.blurDataUrl || undefined}
          className="object-cover"
        />
      ) : (
        <ArchArt tone={tone} />
      )}
    </div>
  );
}
