import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { UploadForm } from "@/components/upload/upload-form";

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign_in_auth/sign-in");
  }

  return (
    <div className="min-h-screen noise-texture">
      <UploadForm userId={user.id} />
    </div>
  );
}
