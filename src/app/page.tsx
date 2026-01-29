import { createClient } from "../../supabase/server";
import Link from "next/link";
import { FeedHeader } from "@/components/feed/feed-header";
import { FeedGrid } from "@/components/feed/feed-grid";
import { SignInModal } from "@/app/sign_in_auth/sign-in-modal";
import UserProfile from "@/components/user-profile";


export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Option A: keep your existing FeedHeader, but it currently REQUIRES user.
         So either:
         - update FeedHeader to accept user?: User | null, OR
         - use the simple public header below (Option B).
      */}

      {/* Option B: Simple public header (recommended if you don't want to touch FeedHeader yet) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-zinc-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="font-display text-xl tracking-tight text-zinc-900">
            UNVAULTD
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
  <UserProfile />
) : (
  <SignInModal triggerClassName="px-3 py-2 rounded-full border border-zinc-300 bg-white text-sm hover:bg-zinc-50" />
)}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4">
        {/* IMPORTANT: your FeedGrid currently requires userId and does likes/saves.
           For a public homepage, you have two safe options:

           1) Show skeleton placeholders instead of live feed (zero Supabase changes)
           2) Make FeedGrid support "read-only mode" when no user (requires editing FeedGrid)
        */}

        {/* Option 1: public homepage skeletons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 bg-white overflow-hidden animate-pulse">
              <div className="aspect-square w-full bg-zinc-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-zinc-200 rounded" />
                <div className="h-3 w-1/2 bg-zinc-200 rounded" />
                <div className="h-3 w-1/3 bg-zinc-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Option 2 (later): if user exists, render live feed
        {user ? <FeedGrid userId={user.id} /> : <PublicSkeletonGrid />}
        */}
      </main>
    </div>
  );
}
