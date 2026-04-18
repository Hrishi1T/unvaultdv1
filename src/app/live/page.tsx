import { createClient } from "../../../supabase/server";
import { FeedHeader } from "@/components/feed/feed-header";
import { UpcomingDropList } from "@/components/feed/upcoming-drop-list";

export default async function LivePage() {
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

  // Auto-promote upcoming posts whose event_date is today or in the past → live
  const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  await supabase
    .from("posts")
    .update({ post_type: "live" })
    .eq("post_type", "upcoming")
    .lte("event_date", todayStr)
    .not("event_date", "is", null);

  const { data: postsData } = await supabase
    .from("posts")
    .select(`*, post_images (id, image_url, order_index), likes (user_id)`)
    .eq("post_type", "live")
    .order("created_at", { ascending: false });

  const posts = (postsData || []).map((post: any) => ({
    ...post,
    post_images: (post.post_images || [])
      .slice()
      .sort((a: any, b: any) => a.order_index - b.order_index),
    _count: { likes: (post.likes || []).length },
  }));

  const totalDrops = posts.length;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <FeedHeader user={user} profile={profile} />
      <main className="relative mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top_left,_rgba(244,244,245,0.9),_transparent_58%),radial-gradient(circle_at_top_right,_rgba(245,245,244,0.95),_transparent_44%)]" />

        <section className="mb-12 flex flex-col gap-8 sm:mb-14 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500">
              Available now
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
              Live Drops
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
              The same editorial layout as Upcoming, adapted for pieces that are
              already live and ready to browse now.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-zinc-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
                Total drops
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
                {totalDrops}
              </p>
            </div>
            <div className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
                Status
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">Live now</p>
            </div>
          </div>
        </section>

        {posts.length === 0 ? (
          <div className="rounded-[28px] border border-zinc-200 bg-[linear-gradient(145deg,#ffffff_0%,#f4f4f5_100%)] p-8 text-center shadow-sm sm:p-12">
            <p className="text-lg font-medium text-zinc-900">No live entries yet.</p>
            <p className="mt-2 text-sm text-zinc-500">
              Live drops will appear here as soon as they are published.
            </p>
          </div>
        ) : (
          <UpcomingDropList
            posts={posts}
            userId={user?.id ?? null}
            variant="live"
          />
        )}
      </main>
    </div>
  );
}
