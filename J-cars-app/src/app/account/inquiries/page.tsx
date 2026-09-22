import { InquiryStatusBadge, QuoteStatusBadge } from "@/components/status-badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { getClientInquiries } from "@/lib/inquiries/queries";
import { getClientQuotes } from "@/lib/quotes/queries";

export default async function AccountInquiriesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [inquiries, quotes] = await Promise.all([
    getClientInquiries(profile.id),
    getClientQuotes(profile.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Inquiries</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Requests you&apos;ve sent us and any quotes we&apos;ve prepared.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <p className="text-sm text-muted-foreground">You haven&apos;t sent any inquiries yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {inquiries.map((i) => (
            <li key={i.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
              <span>{i.vehicleLabel ?? "General inquiry"}</span>
              <InquiryStatusBadge status={i.status} />
              <span className="text-muted-foreground">{new Date(i.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}

      {quotes.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">Quotes</h2>
          <ul className="flex flex-col gap-2">
            {quotes.map((q) => (
              <li key={q.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <span>{q.vehicleLabel}</span>
                <QuoteStatusBadge status={q.status} />
                <span>${q.totalUsd.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
