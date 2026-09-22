import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { assignInquiry, setInquiryStatus } from "@/actions/inquiries";
import { InquiryStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { INQUIRY_STATUSES } from "@/lib/inquiries/constants";
import { getAssignableStaff, getInquiryById } from "@/lib/inquiries/queries";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [inquiry, staff] = await Promise.all([getInquiryById(id), getAssignableStaff()]);
  if (!inquiry) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{inquiry.name}</h1>
        <InquiryStatusBadge status={inquiry.status} />
      </div>

      {inquiry.vehicleSlug && (
        <Link
          href={`/cars/${inquiry.vehicleSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted"
        >
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {inquiry.vehicleImageUrl && (
              <Image src={inquiry.vehicleImageUrl} alt="" fill unoptimized className="object-cover" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{inquiry.vehicleLabel}</p>
            <p className="text-xs text-muted-foreground">View listing ↗</p>
          </div>
        </Link>
      )}

      <dl className="grid grid-cols-2 gap-y-2 rounded-xl border p-4 text-sm">
        <dt className="text-muted-foreground">Email</dt>
        <dd>{inquiry.email}</dd>
        <dt className="text-muted-foreground">Phone</dt>
        <dd>{inquiry.phone ?? "—"}</dd>
        <dt className="text-muted-foreground">Vehicle</dt>
        <dd>{inquiry.vehicleLabel ?? "General inquiry"}</dd>
        <dt className="text-muted-foreground">Received</dt>
        <dd>{new Date(inquiry.createdAt).toLocaleString()}</dd>
      </dl>

      {inquiry.message && (
        <div>
          <h2 className="mb-1 text-sm font-semibold">Message</h2>
          <p className="whitespace-pre-line rounded-xl border p-4 text-sm text-muted-foreground">
            {inquiry.message}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <form action={assignInquiry.bind(null, inquiry.id)} className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="assigneeId" className="text-sm font-medium">
              Assign to
            </label>
            <select
              id="assigneeId"
              name="assigneeId"
              defaultValue={inquiry.assignedTo ?? ""}
              className={selectClassName}
            >
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" size="sm" variant="outline">
            Assign
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {INQUIRY_STATUSES.filter((s) => s !== inquiry.status).map((s) => (
            <form key={s} action={setInquiryStatus.bind(null, inquiry.id, s)}>
              <Button type="submit" size="sm" variant="outline" className="capitalize">
                Mark {s}
              </Button>
            </form>
          ))}
        </div>
      </div>

      {inquiry.vehicleId && (
        <Button asChild className="w-fit">
          <Link href={`/admin/quotes/new?inquiryId=${inquiry.id}`}>Create Quote</Link>
        </Button>
      )}

      {inquiry.quotes.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Quotes</h2>
          <ul className="flex flex-col gap-2">
            {inquiry.quotes.map((q) => (
              <li key={q.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <span className="capitalize">{q.status}</span>
                <span>${q.totalUsd.toLocaleString()}</span>
                <Button asChild size="xs" variant="outline">
                  <Link href={`/admin/quotes/${q.id}/edit`}>Edit</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
