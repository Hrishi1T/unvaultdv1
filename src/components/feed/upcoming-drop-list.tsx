"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarClock, ExternalLink, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../supabase/client";
import { openSignInModal } from "@/lib/open-sign-in-modal";

interface PostImage {
  id: string;
  image_url: string;
  order_index: number;
}

interface UpcomingPost {
  id: string;
  brand: string;
  brand_website?: string | null;
  description?: string | null;
  event_date?: string | null;
  created_at?: string | null;
  post_images: PostImage[];
  likes?: { user_id: string }[];
  _count?: { likes: number };
}

interface UpcomingDropListProps {
  posts: UpcomingPost[];
  userId: string | null;
  variant?: "upcoming" | "live";
}

function safeUrl(url?: string | null) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function formatDropDate(dateStr?: string | null) {
  if (!dateStr) return "Release date to be announced";

  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatPublishedDate(dateStr?: string | null) {
  if (!dateStr) return "Available now";

  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function UpcomingDropList({
  posts: initialPosts,
  userId,
  variant = "upcoming",
}: UpcomingDropListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const router = useRouter();
  const supabase = createClient();

  const handleLike = useCallback(
    async (postId: string) => {
      if (!userId) {
        const opened = openSignInModal();
        if (!opened) router.push("/sign_in_auth/sign-in");
        return;
      }

      const post = posts.find((entry) => entry.id === postId);
      if (!post) return;

      const isLiked = post.likes?.some((like) => like.user_id === userId);

      setPosts((prev) =>
        prev.map((entry) => {
          if (entry.id !== postId) return entry;

          const nextLikes = isLiked
            ? (entry.likes || []).filter((like) => like.user_id !== userId)
            : [...(entry.likes || []), { user_id: userId }];

          const nextCount = isLiked
            ? Math.max(0, (entry._count?.likes || 0) - 1)
            : (entry._count?.likes || 0) + 1;

          return {
            ...entry,
            likes: nextLikes,
            _count: { ...entry._count, likes: nextCount },
          };
        }),
      );

      if (isLiked) {
        await supabase
          .from("likes")
          .delete()
          .match({ post_id: postId, user_id: userId });
      } else {
        await supabase.from("likes").insert({ post_id: postId, user_id: userId });
      }
    },
    [posts, router, supabase, userId],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {posts.map((post) => {
        const isLiked = post.likes?.some((like) => like.user_id === userId);
        const likeCount = post._count?.likes || 0;
        const postImages = post.post_images
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .slice(0, 2);
        const websiteUrl = safeUrl(post.brand_website);
        const statusLabel = variant === "live" ? "Live now" : "Upcoming drop";
        const metaLabel =
          variant === "live"
            ? `Published ${formatPublishedDate(post.created_at)}`
            : formatDropDate(post.event_date);
        const returnPath = variant === "live" ? "/live" : "/upcoming";
        const detailHref = `/listing/${post.id}?from=${encodeURIComponent(returnPath)}`;

        return (
          <article
            key={post.id}
            className="overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white/90 shadow-[0_22px_90px_-48px_rgba(24,24,27,0.28)] backdrop-blur"
          >
            <div className="p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-4">
                  <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
                    {statusLabel}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                      {post.brand}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 sm:text-base">
                      <span className="inline-flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        {metaLabel}
                      </span>
                      {websiteUrl && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-zinc-600 transition hover:text-zinc-950"
                        >
                          Brand site
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {post.description && (
                    <p className="max-w-3xl text-sm leading-6 text-zinc-600 sm:text-[15px]">
                      {post.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={detailHref}
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    View drop
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className={`inline-flex min-w-[52px] items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition ${
                      isLiked
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
                    }`}
                    aria-label={isLiked ? "Unlike drop" : "Like drop"}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                    <span>{likeCount}</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-[1.08fr_1fr]">
                {postImages.length > 0 ? (
                  postImages.map((image, index) => (
                    <Link
                      key={image.id}
                      href={detailHref}
                      className="group/image relative overflow-hidden rounded-[24px] bg-zinc-100"
                    >
                      <div
                        className={`relative ${
                          postImages.length === 1
                            ? "aspect-[16/10] sm:aspect-[16/9]"
                            : "aspect-[4/5] sm:aspect-[5/6] md:aspect-[4/4.9]"
                        }`}
                      >
                        <Image
                          src={image.image_url}
                          alt={`${post.brand} image ${index + 1}`}
                          fill
                          className="object-cover transition duration-500 group-hover/image:scale-[1.02]"
                          sizes={
                            postImages.length === 1
                              ? "(max-width: 768px) 100vw, 1000px"
                              : "(max-width: 768px) 100vw, 50vw"
                          }
                        />
                      </div>
                    </Link>
                  ))
                ) : (
                  <Link
                    href={detailHref}
                    className="flex aspect-[16/10] items-end rounded-[24px] border border-dashed border-zinc-200 bg-[linear-gradient(135deg,#fafaf9_0%,#f4f4f5_100%)] p-5"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{post.brand}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Imagery will appear here once the drop assets are added.
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
