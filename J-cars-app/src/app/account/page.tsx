import { getCurrentProfile } from "@/lib/auth/session";

export default async function AccountSummaryPage() {
  const profile = await getCurrentProfile();

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Favorites, orders, and quotes will summarize here starting Phase 4.
      </p>
    </div>
  );
}
