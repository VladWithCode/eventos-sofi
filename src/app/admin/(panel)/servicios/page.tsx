import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { moveService, removeService } from "@/app/actions/admin/services";
import { ContentItem, NewItemCard } from "@/components/admin/content-list";
import { ConfirmDelete } from "@/components/admin/form-controls";
import { MoveButtons } from "@/components/admin/move-buttons";
import { ServiceForm } from "@/components/admin/service-form";
import { PageSkeleton } from "@/components/admin/skeleton";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { listServices } from "@/lib/data/services";

export const metadata: Metadata = { title: "Servicios" };

export default function ServicesPage() {
  return (
    <>
      <PageHeader title="Servicios" description="Lo que ofreces. Usa las flechas para cambiar el orden en el sitio." />
      <Suspense fallback={<PageSkeleton />}>
        <Services />
      </Suspense>
    </>
  );
}

async function Services() {
  await requireAdmin();
  const services = listServices({ onlyVisible: false });

  return (
    <div className="flex flex-col gap-4">
      <NewItemCard label="+ Agregar servicio">
        <ServiceForm />
      </NewItemCard>
      {services.length === 0 ? (
        <EmptyState icon={<Sparkles aria-hidden className="size-5" />} title="Sin servicios" />
      ) : (
        <ul className="flex flex-col gap-3">
          {services.map((service, index) => (
            <li key={service.id}>
              <ContentItem
                title={service.title}
                subtitle={service.summary}
                visible={service.visible}
                controls={
                  <MoveButtons
                    action={moveService}
                    id={service.id}
                    isFirst={index === 0}
                    isLast={index === services.length - 1}
                  />
                }
              >
                <ServiceForm service={service} />
                <div className="border-t border-line pt-3">
                  <ConfirmDelete
                    action={removeService}
                    id={service.id}
                    compact
                    title="¿Eliminar este servicio?"
                    description={`“${service.title}” dejará de aparecer en el sitio. Esta acción no se puede deshacer.`}
                    label="Eliminar servicio"
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
