import { Archive, Check, Inbox, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { changeMessageStatus, removeMessage } from "@/app/actions/admin/messages";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { ConfirmDelete, SubmitButton } from "@/components/admin/form-controls";
import { PageSkeleton } from "@/components/admin/skeleton";
import { Badge, Card, EmptyState, PageHeader, buttonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { countContactsByStatus, listContacts, type ContactRequest } from "@/lib/data/contacts";
import { readSettings } from "@/lib/data/settings";
import { formatTimestamp } from "@/lib/dates";
import { formatMxPhone, whatsappLink } from "@/lib/phone";
import { CONTACT_STATUS, CONTACT_STATUSES, isContactStatus, type ContactStatus } from "@/lib/statuses";

export const metadata: Metadata = { title: "Mensajes" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function MessagesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader title="Mensajes" description="Preguntas que llegan desde el formulario de contacto." />
      <Suspense fallback={<PageSkeleton />}>
        <Messages searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Messages({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const { estado } = await searchParams;
  const status = isContactStatus(estado) ? estado : undefined;
  const counts = countContactsByStatus();
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const messages = listContacts(status);
  const { businessName } = readSettings();

  return (
    <div className="flex flex-col gap-5">
      <FilterTabs
        label="Filtrar por estado"
        tabs={[
          { href: "/admin/mensajes", label: "Todos", count: total, active: !status },
          ...CONTACT_STATUSES.map((s) => ({
            href: `/admin/mensajes?estado=${s}`,
            label: CONTACT_STATUS[s].label,
            count: counts[s],
            active: status === s,
          })),
        ]}
      />
      {messages.length === 0 ? (
        <EmptyState
          icon={<Inbox aria-hidden className="size-5" />}
          title={status ? "Nada por aquí" : "Aún no hay mensajes"}
          description="Los mensajes del formulario de contacto aparecerán aquí."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((m) => (
            <li key={m.id}>
              <MessageCard message={m} businessName={businessName} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusButton({ id, status, children }: { id: number; status: ContactStatus; children: React.ReactNode }) {
  return (
    <form action={changeMessageStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton variant="secondary" size="sm" pendingLabel="…" className="min-h-11">
        {children}
      </SubmitButton>
    </form>
  );
}

function MessageCard({ message: m, businessName }: { message: ContactRequest; businessName: string }) {
  const meta = CONTACT_STATUS[m.status];
  const reply = `¡Hola ${m.name.split(" ")[0]}! Te saluda ${businessName}. Gracias por tu mensaje.`;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">{m.name}</p>
          <p className="text-[0.85rem] text-muted">
            <a href={`tel:+${m.phone}`} className="rounded hover:underline">
              {formatMxPhone(m.phone)}
            </a>{" "}
            · {formatTimestamp(m.createdAt)}
          </p>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>
      <p className="whitespace-pre-line">{m.message}</p>
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <a
          href={whatsappLink(m.phone, reply)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("primary", "sm", "min-h-11")}
        >
          <MessageCircle aria-hidden className="size-4" />
          Responder por WhatsApp
        </a>
        {m.status !== "respondido" ? (
          <StatusButton id={m.id} status="respondido">
            <Check aria-hidden className="size-4" />
            Marcar respondido
          </StatusButton>
        ) : null}
        {m.status !== "archivado" ? (
          <StatusButton id={m.id} status="archivado">
            <Archive aria-hidden className="size-4" />
            Archivar
          </StatusButton>
        ) : (
          <StatusButton id={m.id} status="nuevo">
            Mover a sin responder
          </StatusButton>
        )}
        <div className="ml-auto">
          <ConfirmDelete
            action={removeMessage}
            id={m.id}
            compact
            title="¿Eliminar este mensaje?"
            description={`Se borrará el mensaje de ${m.name} de forma permanente. Esta acción no se puede deshacer.`}
          />
        </div>
      </div>
    </Card>
  );
}
