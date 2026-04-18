import { createClient } from "../../../supabase/server";
import { FeedHeader } from "@/components/feed/feed-header";
import { UpcomingDropList } from "@/components/feed/upcoming-drop-list";

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function UpcomingPage() {
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
    .eq("post_type", "upcoming")
    .order("event_date", { ascending: true })
    .order("created_at", { ascending: false });

  const posts = (postsData || []).map((post: any) => ({
    ...post,
    post_images: (post.post_images || [])
      .slice()
      .sort((a: any, b: any) => a.order_index - b.order_index),
    _count: { likes: (post.likes || []).length },
  }));

  // Group by event_date
  const grouped: Record<string, typeof posts> = {};
  const noDateKey = "__no_date__";

  for (const post of posts) {
    const key = post.event_date || noDateKey;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(post);
  }

  // Sort date keys ascending, no-date at end
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === noDateKey) return 1;
    if (b === noDateKey) return -1;
    return a < b ? -1 : 1;
  });

  const nextDatedKey = sortedKeys.find((key) => key !== noDateKey);
  const totalDrops = posts.length;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <FeedHeader user={user} profile={profile} />
      <main className="relative mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top_left,_rgba(244,244,245,0.9),_transparent_58%),radial-gradient(circle_at_top_right,_rgba(245,245,244,0.95),_transparent_44%)]" />

        <section className="mb-12 flex flex-col gap-8 sm:mb-14 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500">
              Release calendar
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
              Upcoming Drops
            </h1>
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
                Next release
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {nextDatedKey ? formatDate(nextDatedKey) : "To be announced"}
              </p>
            </div>
          </div>
        </section>

        {posts.length === 0 ? (
          <div className="rounded-[28px] border border-zinc-200 bg-[linear-gradient(145deg,#ffffff_0%,#f4f4f5_100%)] p-8 text-center shadow-sm sm:p-12">
            <p className="text-lg font-medium text-zinc-900">No upcoming entries yet.</p>
            <p className="mt-2 text-sm text-zinc-500">
              New scheduled drops will appear here as soon as they are published.
            </p>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-14 lg:space-y-16">
            {sortedKeys.map((dateKey) => (
              <section key={dateKey} className="space-y-6 sm:space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500">
                      {dateKey === noDateKey ? "Flexible release window" : "Scheduled release"}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
                      {dateKey === noDateKey ? "Coming Soon" : formatDate(dateKey)}
                    </h2>
                  </div>
                  <div className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm">
                    {grouped[dateKey].length} {grouped[dateKey].length === 1 ? "drop" : "drops"}
                  </div>
                </div>

                <UpcomingDropList
                  posts={grouped[dateKey]}
                  userId={user?.id ?? null}
                />
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

