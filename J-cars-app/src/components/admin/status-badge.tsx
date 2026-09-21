import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  available: "default",
  reserved: "secondary",
  in_transit: "secondary",
  sold: "outline",
};

export function VehicleStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "outline"} className="capitalize">
      {status.replace("_", " ")}
    </Badge>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <Badge variant={published ? "default" : "outline"}>{published ? "Published" : "Draft"}</Badge>
  );
}
