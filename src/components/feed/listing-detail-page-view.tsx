"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Edit,
  Heart,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { createClient } from "../../../supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow/follow-button";
import { openSignInModal } from "@/lib/open-sign-in-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function safeUrl(url?: string | null) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

interface ListingDetailPageViewProps {
  postId: string;
  currentUserId: string;
  initialPost?: any;
}

export function ListingDetailPageView({
  postId,
  currentUserId,
  initialPost,
}: ListingDetailPageViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const [post, setPost] = useState<any>(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isOwner = post?.user_id === currentUserId;
  const isLiked = post?.likes?.some((like: any) => like.user_id === currentUserId);
  const isSaved = post?.saves?.some((save: any) => save.user_id === currentUserId);

  const images = useMemo(
    () =>
      post?.post_images?.slice()?.sort((a: any, b: any) => a.order_index - b.order_index) ||
      [],
    [post?.post_images],
  );

  const loadPost = async () => {
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
      .eq("id", postId)
      .single();

    if (!data) {
      setPost(null);
      setLoading(false);
      return;
    }

    setPost({
      ...data,
      _count: {
        likes: data.likes?.length || 0,
        saves: data.saves?.length || 0,
      },
    });
    setLoading(false);
  };

  useEffect(() => {
    if (!initialPost) {
      loadPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  useEffect(() => {
    if (currentImageIndex > images.length - 1) {
      setCurrentImageIndex(0);
    }
  }, [currentImageIndex, images.length]);

  useEffect(() => {
    if (!currentUserId || !post?.users?.id || isOwner) return;
    supabase
      .from("follows")
      .select("id")
      .match({ follower_id: currentUserId, following_id: post.users.id })
      .single()
      .then(({ data }) => setIsFollowingAuthor(!!data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, isOwner, post?.users?.id]);

  const handleLike = async () => {
    if (!currentUserId) {
      const opened = openSignInModal();
      if (!opened) router.push("/sign_in_auth/sign-in");
      return;
    }

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .match({ post_id: postId, user_id: currentUserId });
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: currentUserId });
    }

    loadPost();
  };

  const handleSave = async () => {
    if (!currentUserId) {
      const opened = openSignInModal();
      if (!opened) router.push("/sign_in_auth/sign-in");
      return;
    }

    if (isSaved) {
      await supabase
        .from("saves")
        .delete()
        .match({ post_id: postId, user_id: currentUserId });
    } else {
      await supabase.from("saves").insert({ post_id: postId, user_id: currentUserId });
    }

    loadPost();
  };

  const handleDelete = async () => {
    await supabase.from("posts").delete().eq("id", postId);
    setShowDeleteDialog(false);
    router.push("/");
  };

  const handleMessageClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (currentUserId) return;
    e.preventDefault();
    const opened = openSignInModal();
    if (!opened) router.push("/sign_in_auth/sign-in");
  };

  const nextImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return <div className="py-10 text-center text-zinc-500">Loading listing...</div>;
  }

  if (!post) {
    return (
      <div className="py-10 text-center">
        <p className="text-zinc-700">Listing not found.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
      </div>
    );
  }

  const brandWebsite = safeUrl(post.brand_website);

  return (
    <>
      <article className="mx-auto max-w-3xl pb-10">
        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 hover:bg-zinc-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="relative mt-4 aspect-square w-full overflow-hidden bg-zinc-100">
          {images[currentImageIndex] && (
            <Image
              src={images[currentImageIndex].image_url}
              alt={`${post.brand} ${post.garment_type}`}
              fill
              className="object-cover"
              sizes="100vw"
            />
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentImageIndex ? "w-8 bg-zinc-900" : "w-2 bg-zinc-300"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="space-y-6 px-4 py-6">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-5">
            <Link
              href={`/profile/${post.users?.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-11 w-11 border border-zinc-200">
                <AvatarImage src={post.users?.avatar_url} />
                <AvatarFallback className="bg-zinc-100 text-zinc-800 font-medium">
                  {post.users?.name?.charAt(0)?.toUpperCase() ||
                    post.users?.username?.charAt(0)?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {post.users?.name || "Anonymous"}
                </p>
                <p className="text-xs text-zinc-500">
                  @{post.users?.username || `user_${post.user_id?.slice(0, 8)}`}
                </p>
              </div>
            </Link>

            {!isOwner && (
              <div className="flex items-center gap-2">
                <FollowButton
                  targetUserId={post.users?.id}
                  currentUserId={currentUserId || null}
                  isFollowing={isFollowingAuthor}
                  onToggle={() => setIsFollowingAuthor(!isFollowingAuthor)}
                  size="sm"
                />
                <Link
                  href={`/messages?user=${post.users?.id}`}
                  onClick={handleMessageClick}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  aria-label="Message user"
                >
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{post.brand}</h1>
            <p className="text-sm text-zinc-600">{post.garment_type}</p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                Color
              </span>
              <p className="text-sm text-zinc-900">{post.color}</p>
            </div>

            {post.size_fit && (
              <div>
                <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                  Size / Fit
                </span>
                <p className="text-sm text-zinc-900">{post.size_fit}</p>
              </div>
            )}

            {brandWebsite && (
              <div>
                <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                  Brand Website
                </span>
                <a
                  href={brandWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm text-blue-600 hover:underline"
                >
                  {brandWebsite}
                </a>
              </div>
            )}

            {post.description && (
              <div>
                <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                  Description
                </span>
                <p className="text-sm leading-relaxed text-zinc-900">{post.description}</p>
              </div>
            )}
          </div>

          <div className="text-xs text-zinc-500">
            Posted{" "}
            {new Date(post.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          <div className="flex items-center gap-3 border-t border-zinc-200 pt-5">
            <button
              onClick={handleLike}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm transition ${
                isLiked
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
              }`}
              aria-label="Like"
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="font-semibold">{post._count?.likes || 0}</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm transition ${
                isSaved
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
              }`}
              aria-label="Save"
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              <span className="font-semibold">{post._count?.saves || 0}</span>
            </button>
          </div>

          {isOwner && (
            <div className="flex gap-3">
              <Link
                href={`/edit/${post.id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </article>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border border-zinc-200 bg-white shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-zinc-900">
              Delete Post?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-zinc-600">
              This action cannot be undone. This will permanently delete your post
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
