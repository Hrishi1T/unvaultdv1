import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import { FeedGrid } from "@/components/feed/feed-grid";
import { FeedHeader } from "@/components/feed/feed-header";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen noise-texture">
      <FeedHeader user={user} />
      <FeedGrid userId={user.id} />
    </div>
  );
}
