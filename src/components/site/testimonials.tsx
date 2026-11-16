import { Star } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { eventTypeLabel } from "@/lib/event-types";
import type { Testimonial } from "@/lib/types";

/**
 * Client words in a native scroll-snap row: the browser supplies 1:1 touch
 * tracking, momentum and edge rubber-banding.
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <ul className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4 sm:-mx-8 sm:scroll-px-8 sm:gap-6 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
      {testimonials.map((testimonial, index) => (
        <Reveal
          as="li"
          key={testimonial.id}
          delay={(index % 3) * 0.08}
          className="flex w-[84vw] max-w-[26rem] shrink-0 snap-start flex-col rounded-[2rem] border border-line bg-surface p-7 shadow-soft sm:p-9 lg:w-auto lg:max-w-none"
        >
          <p className="flex gap-1 text-gold" aria-label={`${testimonial.rating} de 5 estrellas`}>
            {Array.from({ length: 5 }, (_, star) => (
              <Star
                key={star}
                aria-hidden
                className={`size-4 ${star < testimonial.rating ? "fill-current" : "text-line"}`}
              />
            ))}
          </p>
          <blockquote className="mt-5 font-display text-[1.5rem] leading-[1.25] font-medium tracking-[-0.01em] text-pretty">
            “{testimonial.quote}”
          </blockquote>
          <footer className="mt-auto pt-7">
            <p className="font-semibold">{testimonial.author}</p>
            <p className="text-[0.9rem] text-muted">{eventTypeLabel(testimonial.eventType)}</p>
          </footer>
        </Reveal>
      ))}
    </ul>
  );
}
