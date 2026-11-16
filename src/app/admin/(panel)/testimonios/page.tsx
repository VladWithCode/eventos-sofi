import { Quote } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { moveTestimonial, removeTestimonial } from "@/app/actions/admin/testimonials";
import { ContentItem, NewItemCard } from "@/components/admin/content-list";
import { ConfirmDelete } from "@/components/admin/form-controls";
import { MoveButtons } from "@/components/admin/move-buttons";
import { PageSkeleton } from "@/components/admin/skeleton";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { listTestimonials } from "@/lib/data/testimonials";
import { eventTypeLabel } from "@/lib/event-types";

export const metadata: Metadata = { title: "Testimonios" };

export default function TestimonialsPage() {
  return (
    <>
      <PageHeader
        title="Testimonios"
        description="Opiniones reales de tus clientes. Pide su permiso antes de publicarlas."
      />
      <Suspense fallback={<PageSkeleton />}>
        <Testimonials />
      </Suspense>
    </>
  );
}

async function Testimonials() {
  await requireAdmin();
  const testimonials = listTestimonials({ onlyVisible: false });

  return (
    <div className="flex flex-col gap-4">
      <NewItemCard label="+ Agregar testimonio">
        <TestimonialForm />
      </NewItemCard>
      {testimonials.length === 0 ? (
        <EmptyState
          icon={<Quote aria-hidden className="size-5" />}
          title="Sin testimonios todavía"
          description="Cuando un cliente te comparta su opinión, agrégala aquí."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {testimonials.map((t, index) => (
            <li key={t.id}>
              <ContentItem
                title={`${t.author} · ${"★".repeat(t.rating)}`}
                subtitle={`${eventTypeLabel(t.eventType)} — “${t.quote}”`}
                visible={t.visible}
                controls={
                  <MoveButtons
                    action={moveTestimonial}
                    id={t.id}
                    isFirst={index === 0}
                    isLast={index === testimonials.length - 1}
                  />
                }
              >
                <TestimonialForm testimonial={t} />
                <div className="border-t border-line pt-3">
                  <ConfirmDelete
                    action={removeTestimonial}
                    id={t.id}
                    compact
                    title="¿Eliminar este testimonio?"
                    description={`El testimonio de ${t.author} se borrará. Esta acción no se puede deshacer.`}
                    label="Eliminar testimonio"
                  />
                </div>
              </ContentItem>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
