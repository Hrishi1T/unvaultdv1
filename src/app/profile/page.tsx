import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <ProfileView userId={user.id} isOwnProfile={true} />;
}
