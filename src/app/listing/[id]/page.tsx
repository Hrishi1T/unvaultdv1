import { notFound } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import { FeedHeader } from "@/components/feed/feed-header";
import { ListingDetailPageView } from "@/components/feed/listing-detail-page-view";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
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

  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      users!posts_user_id_fkey (id, email, name, username, avatar_url),
      post_images (id, image_url, order_index),
      likes (id, user_id),
      saves (id, user_id)
    `)
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  const initialPost = {
    ...post,
    post_images: post.post_images?.slice()?.sort(
      (a: any, b: any) => a.order_index - b.order_index,
    ),
    _count: {
      likes: post.likes?.length || 0,
      saves: post.saves?.length || 0,
    },
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <FeedHeader user={user} profile={profile} />
      <main>
        <ListingDetailPageView
          postId={id}
          currentUserId={user?.id || ""}
          initialPost={initialPost}
        />
      </main>
    </div>
  );
}
