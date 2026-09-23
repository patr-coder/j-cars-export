import { ContentBlocks } from "@/components/cms/content-blocks";
import type { CmsPage } from "@/lib/settings/queries";

// Shared shell for the admin-editable public pages. `fallbackTitle` keeps the
// page usable if the owner unpublishes or deletes its CMS row.
export function CmsPageView({
  page,
  fallbackTitle,
  children,
}: {
  page: CmsPage | null;
  fallbackTitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{page?.title ?? fallbackTitle}</h1>
      {page && (
        <div className="mt-4">
          <ContentBlocks body={page.body} />
        </div>
      )}
      {children}
    </div>
  );
}
