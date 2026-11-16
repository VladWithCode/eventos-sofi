import { CircleHelp } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { moveFaq, removeFaq } from "@/app/actions/admin/faqs";
import { ContentItem, NewItemCard } from "@/components/admin/content-list";
import { FaqForm } from "@/components/admin/faq-form";
import { ConfirmDelete } from "@/components/admin/form-controls";
import { MoveButtons } from "@/components/admin/move-buttons";
import { PageSkeleton } from "@/components/admin/skeleton";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { listFaqs } from "@/lib/data/faqs";

export const metadata: Metadata = { title: "Preguntas frecuentes" };

export default function FaqsPage() {
  return (
    <>
      <PageHeader title="Preguntas frecuentes" description="Respuestas a lo que más te preguntan tus clientes." />
      <Suspense fallback={<PageSkeleton />}>
        <Faqs />
      </Suspense>
    </>
  );
}

async function Faqs() {
  await requireAdmin();
  const faqs = listFaqs({ onlyVisible: false });

  return (
    <div className="flex flex-col gap-4">
      <NewItemCard label="+ Agregar pregunta">
        <FaqForm />
      </NewItemCard>
      {faqs.length === 0 ? (
        <EmptyState icon={<CircleHelp aria-hidden className="size-5" />} title="Sin preguntas" />
      ) : (
        <ul className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <li key={faq.id}>
              <ContentItem
                title={faq.question}
                subtitle={faq.answer}
                visible={faq.visible}
                controls={
                  <MoveButtons action={moveFaq} id={faq.id} isFirst={index === 0} isLast={index === faqs.length - 1} />
                }
              >
                <FaqForm faq={faq} />
                <div className="border-t border-line pt-3">
                  <ConfirmDelete
                    action={removeFaq}
                    id={faq.id}
                    compact
                    title="¿Eliminar esta pregunta?"
                    description="La pregunta dejará de aparecer en el sitio. Esta acción no se puede deshacer."
                    label="Eliminar pregunta"
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
