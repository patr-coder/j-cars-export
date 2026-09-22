import Link from "next/link";

import { deleteSavedSearch } from "@/actions/saved-searches";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getSavedSearches } from "@/lib/saved-searches/queries";

export default async function SavedSearchesPage() {
  const user = await getCurrentUser();
  const searches = user ? await getSavedSearches(user.id) : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Saved searches</h1>
      <p className="mt-2 text-muted-foreground">
        Re-run a saved search anytime, and get emailed when a matching vehicle is added.
      </p>

      {searches.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          You haven&apos;t saved any searches yet — save one from the filters on the Stock page.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {searches.map((search) => {
            const query = new URLSearchParams(search.filtersJson).toString();
            return (
              <li key={search.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                <div>
                  <p className="font-medium">{search.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground">
                    {Object.entries(search.filtersJson).map(([key, value]) => (
                      <span key={key} className="rounded-full border px-2 py-0.5">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                  {search.emailAlerts && (
                    <p className="mt-1 text-xs text-muted-foreground">Email alerts on</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={query ? `/stock?${query}` : "/stock"}>View results</Link>
                  </Button>
                  <form action={deleteSavedSearch.bind(null, search.id)}>
                    <Button type="submit" size="sm" variant="ghost">
                      Delete
                    </Button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
