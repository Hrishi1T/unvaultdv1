import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import { ProfileView } from "@/components/profile/profile-view";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign_in_auth/sign-in");
  }

  return <ProfileView userId={id} isOwnProfile={user.id === id} />;
}
