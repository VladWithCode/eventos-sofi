import { Images } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { moveGalleryItem, removeGalleryItem } from "@/app/actions/admin/gallery";
import { ConfirmDelete } from "@/components/admin/form-controls";
import { GalleryItemForm } from "@/components/admin/gallery-item-form";
import { GalleryUploader } from "@/components/admin/gallery-uploader";
import { MoveButtons } from "@/components/admin/move-buttons";
import { PageSkeleton } from "@/components/admin/skeleton";
import { Badge, Card, CardTitle, EmptyState, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { listGallery } from "@/lib/data/gallery";
import { eventTypeLabel } from "@/lib/event-types";

export const metadata: Metadata = { title: "Galería" };

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        title="Galería"
        description="Fotos reales de tus eventos. Las marcadas como “Destacada” aparecen en la portada del sitio."
      />
      <Suspense fallback={<PageSkeleton />}>
        <Gallery />
      </Suspense>
    </>
  );
}

async function Gallery() {
  await requireAdmin();
  const items = listGallery({ onlyVisible: false });

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardTitle className="mb-4">Subir fotos</CardTitle>
        <GalleryUploader />
      </Card>

      {items.length === 0 ? (
        <EmptyState
          icon={<Images aria-hidden className="size-5" />}
          title="Tu galería está vacía"
          description="Sube fotos de eventos que hayas realizado. Se optimizan automáticamente para que el sitio cargue rápido."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.id}>
              <Card padded={false} className="overflow-hidden">
                <div className="relative aspect-[4/3] bg-sand">
                  <Image
                    src={item.image.url}
                    alt={item.image.alt}
                    fill
                    sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 100vw"
                    placeholder="blur"
                    blurDataURL={item.image.blurDataUrl}
                    className={"object-cover " + (item.visible ? "" : "opacity-50")}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {item.featured ? <Badge tone="gold">Destacada</Badge> : null}
                    {item.visible ? null : <Badge>Oculta</Badge>}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 pt-3">
                  <p className="min-w-0 truncate text-[0.9rem] font-semibold">
                    {item.caption || eventTypeLabel(item.eventType)}
                  </p>
                  <MoveButtons
                    action={moveGalleryItem}
                    id={item.id}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                  />
                </div>
                <details className="group px-4 pb-4">
                  <summary className="flex min-h-11 items-center text-[0.9rem] font-semibold text-blue-deep">
                    Editar detalles
                  </summary>
                  <div className="flex flex-col gap-3 pt-2">
                    <GalleryItemForm item={item} />
                    <div className="border-t border-line pt-3">
                      <ConfirmDelete
                        action={removeGalleryItem}
                        id={item.id}
                        compact
                        title="¿Eliminar esta foto?"
                        description="La foto se borrará del sitio y del servidor. Esta acción no se puede deshacer."
                        label="Eliminar foto"
                      />
                    </div>
                  </div>
                </details>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
