import { NotFoundContent } from "@/components/layout/not-found-content";

export default function AdminNotFound() {
  return (
    <NotFoundContent
      primaryHref="/admin"
      primaryLabel="Back to dashboard"
      secondaryHref="/admin/vehicles"
      secondaryLabel="View vehicles"
    />
  );
}
