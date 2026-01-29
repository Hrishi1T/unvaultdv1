"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../supabase/client";
import { FeedHeader } from "@/components/feed/feed-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard } from "@/components/feed/post-card";
import { PostDetailModal } from "@/components/feed/post-detail-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserIcon } from "@supabase/supabase-js";

type AnyPost = any;

interface ProfileViewProps {
  userId: string;
  isOwnProfile: boolean;
}

export function ProfileView({ userId, isOwnProfile }: ProfileViewProps) {
  const supabase = createClient();

  const [authUser, setAuthUser] = useState<UserIcon | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [user, setUser] = useState<any>(null);

  const [posts, setPosts] = useState<AnyPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<AnyPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<AnyPost[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<AnyPost | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "likes" | "saved">(
    "posts",
  );

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setAuthUser(data.user);
        setCurrentUserId(data.user.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUserId]);

  const normalizePosts = (rows: any[] | null | undefined) => {
    if (!rows) return [];
    return rows.map((post: any) => ({
      ...post,
      _count: {
        likes: post.likes?.length || 0,
        saves: post.saves?.length || 0,
      },
    }));
  };

  const loadProfileData = async () => {
    setLoading(true);

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    setUser(userData);

    // Posts
    const { data: postsData } = await supabase
      .from("posts")
      .select(
        `
        *,
        users!posts_user_id_fkey (id, email, name, avatar_url),
        post_images (id, image_url, order_index),
        likes (id, user_id),
        saves (id, user_id)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setPosts(normalizePosts(postsData));

    // Saved (own profile only)
    if (isOwnProfile) {
      const { data: savesData } = await supabase
        .from("saves")
        .select(
          `
          post_id,
          posts (
            *,
            users!posts_user_id_fkey (id, email, name, avatar_url),
            post_images (id, image_url, order_index),
            likes (id, user_id),
            saves (id, user_id)
          )
        `,
        )
        .eq("user_id", userId);

      const saved = (savesData || []).map((s: any) => s.posts).filter(Boolean);

      setSavedPosts(normalizePosts(saved));

      // Likes (own profile only) — Depop-like “Likes” tab
      const { data: likesData } = await supabase
        .from("likes")
        .select(
          `
          post_id,
          posts (
            *,
            users!posts_user_id_fkey (id, email, name, avatar_url),
            post_images (id, image_url, order_index),
            likes (id, user_id),
            saves (id, user_id)
          )
        `,
        )
        .eq("user_id", userId);

      const liked = (likesData || []).map((l: any) => l.posts).filter(Boolean);

      setLikedPosts(normalizePosts(liked));
    } else {
      setSavedPosts([]);
      setLikedPosts([]);
      setActiveTab("posts");
    }

    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    if (!currentUserId) return;

    const all = [...posts, ...savedPosts, ...likedPosts];
    const post = all.find((p) => p.id === postId);
    const isLiked = post?.likes?.some(
      (like: any) => like.user_id === currentUserId,
    );

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .match({ post_id: postId, user_id: currentUserId });
    } else {
      await supabase
        .from("likes")
        .insert({ post_id: postId, user_id: currentUserId });
    }

    loadProfileData();
  };

  const handleSave = async (postId: string) => {
    if (!currentUserId) return;

    const all = [...posts, ...savedPosts, ...likedPosts];
    const post = all.find((p) => p.id === postId);
    const isSaved = post?.saves?.some((s: any) => s.user_id === currentUserId);

    if (isSaved) {
      await supabase
        .from("saves")
        .delete()
        .match({ post_id: postId, user_id: currentUserId });
    } else {
      await supabase
        .from("saves")
        .insert({ post_id: postId, user_id: currentUserId });
    }

    loadProfileData();
  };

  const tabItems = useMemo(() => {
    const base: Array<{
      key: "posts" | "likes" | "saved";
      label: string;
      count: number;
      show: boolean;
    }> = [
      { key: "posts", label: "Posts", count: posts.length, show: true },
      {
        key: "likes",
        label: "Likes",
        count: likedPosts.length,
        show: isOwnProfile,
      },
      {
        key: "saved",
        label: "Saves",
        count: savedPosts.length,
        show: isOwnProfile,
      },
    ];
    return base.filter((t) => t.show);
  }, [posts.length, likedPosts.length, savedPosts.length, isOwnProfile]);

  const activeList =
    activeTab === "posts"
      ? posts
      : activeTab === "likes"
        ? likedPosts
        : savedPosts;

  const avatarUrl = user?.avatar_url || "";
  const name = user?.name || "Anonymous";
  const email = user?.email || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <FeedHeader user={authUser} />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-start gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-8 pt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
  {/* Match Image 1 header */}
  <FeedHeader user={authUser} />

  <div className="mx-auto max-w-6xl px-4 py-10">
    {/* Depop-like profile header (Image 2 structure) */}
    <section className="flex items-start gap-6">
      <Avatar className="h-20 w-20 border border-zinc-300">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-zinc-100 text-zinc-900 font-display">
          {(name?.[0] || email?.[0] || "U").toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{name}</h1>
            <p className="text-sm text-zinc-600">{email}</p>
            <p className="text-xs text-zinc-500 mt-1">Active today</p>
          </div>

          {isOwnProfile && (
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 bg-white text-sm text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              List an item
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-6 mt-4 text-sm text-zinc-700">
          <span>
            <span className="font-semibold text-zinc-900">{posts.length}</span>{" "}
            Posts
          </span>
          <span>
            <span className="font-semibold text-zinc-900">0</span> Followers
          </span>
          <span>
            <span className="font-semibold text-zinc-900">0</span> Following
          </span>
        </div>

        {/* Tabs + Content constrained to match the post card column */}
        <div className="mt-6 max-w-[320px]">
          {/* Tabs */}
          <div className="border-b border-zinc-200">
            <div className="flex gap-8">
              {tabItems.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={[
                    "pb-3 text-sm font-medium",
                    activeTab === t.key
                      ? "text-zinc-900 border-b-2 border-zinc-900"
                      : "text-zinc-500 hover:text-zinc-800",
                  ].join(" ")}
                >
                  {t.label}
                  <span className="ml-2 text-xs text-zinc-400">({t.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content (moved inside the same constrained wrapper so the divider/section doesn't extend) */}
          <div className="mt-6">
            {activeList.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-8 text-center">
                <div className="text-zinc-900 text-base font-medium">
                  {activeTab === "posts"
                    ? "Start listing today"
                    : activeTab === "likes"
                    ? "No likes yet"
                    : "No saves yet"}
                </div>

                {isOwnProfile && activeTab === "posts" && (
                  <Link
                    href="/upload"
                    className="inline-flex mt-5 items-center justify-center px-5 py-2 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800"
                  >
                    List an item
                  </Link>
                )}
              </div>
            ) : (
              // Single-column stack that matches the constrained width
              <div className="grid gap-6">
                {activeList.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userId={currentUserId}
                    onLike={handleLike}
                    onSave={handleSave}
                    onClick={() => setSelectedPost(post)}
                    style={{
                      animationDelay: `${index * 40}ms`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  </div>
</div>


      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          userId={currentUserId}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onSave={handleSave}
          onUpdate={loadProfileData}
        />
      )}
    </>
  );
}
