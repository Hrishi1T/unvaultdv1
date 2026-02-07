"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../supabase/client";
import { PostCard } from "./post-card";
import { PostDetailModal } from "./post-detail-modal";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
  id: string;
  user_id: string;
  brand: string;
  garment_type: string;
  color: string;
  size_fit: string | null;
  brand_social_link: string | null;
  description: string | null;
  created_at: string;
  users: {
    id: string;
    email: string | null;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  post_images: {
    id: string;
    image_url: string;
    order_index: number;
  }[];
  likes: { id: string; user_id: string }[];
  saves: { id: string; user_id: string }[];
  _count: {
    likes: number;
    saves: number;
  };
}

interface FeedGridProps {
  userId: string;
}

export function FeedGrid({ userId }: FeedGridProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    loadPosts();
    loadFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ DO NOT TOUCH SUPABASE QUERY LOGIC
  const loadPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        users!posts_user_id_fkey (id, email, name, username, avatar_url),
        post_images (id, image_url, order_index),
        likes (id, user_id),
        saves (id, user_id)
      `)
      .order("created_at", { ascending: false });

    if (data) {
      const postsWithCounts = data.map((post: any) => ({
        ...post,
        _count: {
          likes: post.likes?.length || 0,
          saves: post.saves?.length || 0,
        },
      }));
      setPosts(postsWithCounts);
    }

    setLoading(false);
  };

  // ✅ DO NOT TOUCH SUPABASE MUTATION LOGIC
  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    const isLiked = post?.likes.some((like) => like.user_id === userId);

    if (isLiked) {
      await supabase.from("likes").delete().match({ post_id: postId, user_id: userId });
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    }

    loadPosts();
  };

  // ✅ DO NOT TOUCH SUPABASE MUTATION LOGIC
  const handleSave = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    const isSaved = post?.saves.some((save) => save.user_id === userId);

    if (isSaved) {
      await supabase.from("saves").delete().match({ post_id: postId, user_id: userId });
    } else {
      await supabase.from("saves").insert({ post_id: postId, user_id: userId });
    }

    loadPosts();
  };

  const loadFollowing = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);
    const ids = new Set((data || []).map((f: any) => f.following_id));
    setFollowingIds(ids);
  };

  const handleFollow = async (targetUserId: string) => {
    if (!userId) return;
    const isFollowing = followingIds.has(targetUserId);
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .match({ follower_id: userId, following_id: targetUserId });
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: userId, following_id: targetUserId });
      setFollowingIds((prev) => new Set(prev).add(targetUserId));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
              <Skeleton className="aspect-square w-full rounded-none bg-zinc-200" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-zinc-200" />
                <Skeleton className="h-3 w-1/2 bg-zinc-200" />
                <Skeleton className="h-3 w-1/3 bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userId={userId}
              onLike={handleLike}
              onSave={handleSave}
              onClick={() => setSelectedPost(post)}
              followingIds={followingIds}
              onFollow={handleFollow}
            />
          ))}
        </div>
      </div>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          userId={userId}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onSave={handleSave}
          onUpdate={loadPosts}
        />
      )}
    </>
  );
}
