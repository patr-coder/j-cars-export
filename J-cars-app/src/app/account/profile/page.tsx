import { notFound } from "next/navigation";

import { ProfileForm } from "@/components/account/profile-form";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="mt-2 text-muted-foreground">Your contact details and shipping consignee.</p>
      <ProfileForm profile={profile} />
    </div>
  );
}
