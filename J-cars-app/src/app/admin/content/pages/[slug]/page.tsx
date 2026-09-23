import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCmsPage } from "@/actions/cms";
import { FlashMessage } from "@/components/admin/flash-message";
import { ContentBlocks } from "@/components/cms/content-blocks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/roles";
import { getAdminCmsPage } from "@/lib/settings/queries";

export default async function AdminCmsPageEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireRole(["admin"]);
  const [{ slug }, { error, saved }] = await Promise.all([params, searchParams]);
  const page = await getAdminCmsPage(slug);
  if (!page) notFound();

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <Link href="/admin/content" className="text-sm text-primary hover:underline">
          ← Content
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Edit page: {page.title}</h1>
        <p className="text-sm text-muted-foreground">
          Public URL:{" "}
          <Link href={`/${page.slug}`} className="font-mono text-primary hover:underline">
            /{page.slug}
          </Link>{" "}
          · last saved {new Date(page.updatedAt).toLocaleString()}
        </p>
      </div>
      <FlashMessage error={error} saved={saved} />

      <div className="grid gap-6 lg:grid-cols-2">
        <form action={updateCmsPage.bind(null, page.slug)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={page.title} maxLength={120} required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="body">Content</Label>
            <Textarea id="body" name="body" defaultValue={page.body} rows={18} maxLength={20000} aria-describedby="body-help" />
            <p id="body-help" className="text-xs text-muted-foreground">
              Leave a blank line between paragraphs. Start a line with <code>## </code> for a heading, or{" "}
              <code>- </code> for a bullet point.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="published" name="published" defaultChecked={page.published} />
            <Label htmlFor="published" className="font-normal">
              Published (visible on the site)
            </Label>
          </div>
          <div>
            <Button type="submit">Save page</Button>
          </div>
        </form>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Saved version preview</h2>
          <div className="rounded-xl border p-4">
            <h3 className="text-2xl font-semibold">{page.title}</h3>
            <div className="mt-3">
              <ContentBlocks body={page.body} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
