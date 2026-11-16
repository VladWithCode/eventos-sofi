import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { Faq } from "@/lib/types";

/** Native disclosure widgets: keyboard and screen-reader behavior come for free. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="border-t border-line">
      {faqs.map((faq, index) => (
        <Reveal key={faq.id} delay={Math.min(index, 5) * 0.05} y={16}>
          <details name="preguntas" className="accordion group border-b border-line">
            <summary className="flex min-h-[4.5rem] cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
              <span className="display-md font-medium">{faq.question}</span>
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/15 transition-[transform,background-color,color,border-color] duration-500 ease-(--ease-out-expo) group-open:rotate-45 group-open:border-ink group-open:bg-ink group-open:text-paper"
              >
                <Plus className="size-5" />
              </span>
            </summary>
            <p className="max-w-[40rem] pr-10 pb-7 whitespace-pre-line text-ink-soft">{faq.answer}</p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}
