"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../supabase/client";
import { PostCard } from "./post-card";
import { PostDetailModal } from "./post-detail-modal";

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

interface PublicFeedGridProps {
  posts: Post[];
  userId: string | null;
}

export function PublicFeedGrid({ posts: initialPosts, userId }: PublicFeedGridProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const refreshPosts = async () => {
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
        post_images: post.post_images?.slice()?.sort((a: any, b: any) => a.order_index - b.order_index),
        _count: {
          likes: post.likes?.length || 0,
          saves: post.saves?.length || 0,
        },
      }));
      setPosts(postsWithCounts);
      
      // Update selectedPost if it's still open
      if (selectedPost) {
        const updatedPost = postsWithCounts.find((p: Post) => p.id === selectedPost.id);
        if (updatedPost) {
          setSelectedPost(updatedPost);
        } else {
          // Post was deleted
          setSelectedPost(null);
        }
      }
    }
  };

  const handleLike = async (postId: string) => {
    if (!userId) {
      // Redirect to sign in if not authenticated
      router.push("/sign_in_auth/sign-in");
      return;
    }

    const post = posts.find((p) => p.id === postId);
    const isLiked = post?.likes.some((like) => like.user_id === userId);

    if (isLiked) {
      await supabase.from("likes").delete().match({ post_id: postId, user_id: userId });
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    }

    refreshPosts();
  };

  const handleSave = async (postId: string) => {
    if (!userId) {
      // Redirect to sign in if not authenticated
      router.push("/sign_in_auth/sign-in");
      return;
    }

    const post = posts.find((p) => p.id === postId);
    const isSaved = post?.saves.some((save) => save.user_id === userId);

    if (isSaved) {
      await supabase.from("saves").delete().match({ post_id: postId, user_id: userId });
    } else {
      await supabase.from("saves").insert({ post_id: postId, user_id: userId });
    }

    refreshPosts();
  };

  if (posts.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="col-span-full text-center py-12">
          <p className="text-zinc-500 text-lg">No posts yet. Be the first to upload!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            userId={userId || ""}
            onLike={handleLike}
            onSave={handleSave}
            onClick={() => setSelectedPost(post)}
          />
        ))}
      </div>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          userId={userId || ""}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onSave={handleSave}
          onUpdate={refreshPosts}
        />
      )}
    </>
  );
}
