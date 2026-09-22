import { notFound } from "next/navigation";

import { sendQuote, setQuoteStatus, updateQuote } from "@/actions/quotes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteEditForm } from "@/components/quote/quote-edit-form";
import { QUOTE_STATUSES } from "@/lib/quotes/constants";
import { getQuoteById } from "@/lib/quotes/queries";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuoteById(id);
  if (!quote) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{quote.vehicleLabel}</h1>
          <p className="text-sm text-muted-foreground">{quote.clientLabel}</p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {quote.status}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {quote.status === "draft" && (
          <form action={sendQuote.bind(null, id)}>
            <Button type="submit" size="sm">
              Send quote
            </Button>
          </form>
        )}
        {QUOTE_STATUSES.filter((s) => s !== quote.status && s !== "draft" && s !== "sent").map((s) => (
          <form key={s} action={setQuoteStatus.bind(null, id, s)}>
            <Button type="submit" size="sm" variant="outline" className="capitalize">
              Mark {s}
            </Button>
          </form>
        ))}
      </div>

      <QuoteEditForm quote={quote} action={updateQuote.bind(null, id)} />
    </div>
  );
}
