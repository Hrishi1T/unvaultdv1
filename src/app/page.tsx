import Link from "next/link";
import { createClient } from "../../supabase/server";
import { FeedHeader } from "@/components/feed/feed-header";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("users")
        .select("id, name, username, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <FeedHeader user={user} profile={profile} />
      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
        <nav className="flex flex-col items-center gap-6">
          <Link
            href="/upcoming"
            className="text-5xl sm:text-7xl font-semibold tracking-tight text-zinc-900 hover:text-zinc-400 transition-colors leading-none"
          >
            Upcoming
          </Link>
          <Link
            href="/live"
            className="text-5xl sm:text-7xl font-semibold tracking-tight text-zinc-900 hover:text-zinc-400 transition-colors leading-none"
          >
            Live
          </Link>
        </nav>
      </main>
    </div>
  );
}
