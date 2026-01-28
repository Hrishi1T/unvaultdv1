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
  const supabase = createClient();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        users!posts_user_id_fkey (id, email, name, avatar_url),
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gridAutoRows: "10px",
          }}
        >
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              userId={userId}
              onLike={handleLike}
              onSave={handleSave}
              onClick={() => setSelectedPost(post)}
              style={{
                gridRowEnd: `span ${Math.floor(Math.random() * 20) + 40}`,
                animationDelay: `${index * 50}ms`,
              }}
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
