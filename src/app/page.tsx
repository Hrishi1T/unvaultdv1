import { createClient } from "../../supabase/server";
import Link from "next/link";
import { FeedHeader } from "@/components/feed/feed-header";
import { PublicFeedGrid } from "@/components/feed/public-feed-grid";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the logged-in user's profile row (for avatar_url, username, etc.)
  const { data: profile } = user
    ? await supabase
        .from("users")
        .select("id, name, username, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  // Fetch posts server-side with public access
  const { data: postsData } = await supabase
    .from("posts")
    .select(`
      *,
      users!posts_user_id_fkey (id, email, name, username, avatar_url),
      post_images (id, image_url, order_index),
      likes (id, user_id),
      saves (id, user_id)
    `)
    .order("created_at", { ascending: false });

  const posts = (postsData || []).map((post: any) => ({
    ...post,
    post_images: post.post_images?.slice()?.sort(
      (a: any, b: any) => a.order_index - b.order_index
    ),
    _count: {
      likes: post.likes?.length || 0,
      saves: post.saves?.length || 0,
    },
  }));

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <FeedHeader user={user} profile={profile} />

      <main className="mx-auto max-w-6xl px-4 py-4">
        <PublicFeedGrid posts={posts} userId={user?.id || null} />
      </main>
    </div>
  );
}
