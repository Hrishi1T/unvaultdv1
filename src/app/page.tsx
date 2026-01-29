import { createClient } from "../../supabase/server";
import Link from "next/link";
import { FeedHeader } from "@/components/feed/feed-header";
import { FeedGrid } from "@/components/feed/feed-grid";
import { SignInModal } from "@/app/sign_in_auth/sign-in-modal";
import UserProfile from "@/components/user-profile";
import { PublicFeedGrid } from "@/components/feed/public-feed-grid";


export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch posts server-side with public access
  const { data: postsData } = await supabase
    .from("posts")
    .select(`
      *,
      users!posts_user_id_fkey (id, email, name, avatar_url),
      post_images (id, image_url, order_index),
      likes (id, user_id),
      saves (id, user_id)
    `)
    .order("created_at", { ascending: false });

  const posts = (postsData || []).map((post: any) => ({
    ...post,
    post_images: post.post_images?.slice()?.sort((a: any, b: any) => a.order_index - b.order_index),
    _count: {
      likes: post.likes?.length || 0,
      saves: post.saves?.length || 0,
    },
  }));

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
        <PublicFeedGrid posts={posts} userId={user?.id || null} />
      </main>
    </div>
  );
}
