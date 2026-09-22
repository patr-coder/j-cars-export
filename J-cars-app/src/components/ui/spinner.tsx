import { Loader2Icon } from "lucide-react";

import { cn } from "cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-1 items-center justify-center py-24">
      <Loader2Icon className={cn("size-6 animate-spin text-primary motion-reduce:animate-none", className)} />
    </div>
  );
}
