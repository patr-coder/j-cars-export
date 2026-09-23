import { Check } from "lucide-react";

import { ORDER_TIMELINE } from "@/lib/orders/constants";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  reserved: "Reserved",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  preparing_export: "Preparing export",
  booked_shipping: "Shipping booked",
  shipped: "Shipped",
  arrived: "Arrived",
  completed: "Completed",
};

export function OrderTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return <p className="text-sm text-muted-foreground">This order was cancelled.</p>;
  }

  const currentIndex = ORDER_TIMELINE.indexOf(status as (typeof ORDER_TIMELINE)[number]);

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:flex-wrap" aria-label="Order progress">
      {ORDER_TIMELINE.map((step, index) => {
        const done = index < currentIndex || status === "completed";
        const current = index === currentIndex && status !== "completed";
        return (
          <li
            key={step}
            aria-current={current ? "step" : undefined}
            className="flex items-center gap-2 py-1 text-sm sm:flex-1 sm:flex-col sm:items-start sm:gap-1"
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                done && "border-primary bg-primary text-primary-foreground",
                current && "border-primary text-primary",
                !done && !current && "text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : index + 1}
            </span>
            <span className={cn(current ? "font-medium" : "text-muted-foreground", done && "text-foreground")}>
              {LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
