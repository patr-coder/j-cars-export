import { getCurrentProfile } from "@/lib/auth/session";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Editing (name, phone, consignee, language, currency) lands in Phase
        4. Current record:
      </p>
      <dl className="mt-4 grid max-w-sm grid-cols-2 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Email</dt>
        <dd>{profile?.email}</dd>
        <dt className="text-muted-foreground">Role</dt>
        <dd className="capitalize">{profile?.role.replace("_", " ")}</dd>
      </dl>
    </div>
  );
}
