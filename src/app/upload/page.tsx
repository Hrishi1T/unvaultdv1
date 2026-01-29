import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { FeedHeader } from "@/components/feed/feed-header";
import { UploadForm } from "@/components/upload/upload-form";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign_in_auth/sign-in");

  return (
    <div className="min-h-screen bg-white">
      <FeedHeader user={user} />
      <UploadForm userId={user.id} />
    </div>
  );
}
