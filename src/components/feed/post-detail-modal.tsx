"use client";

import { useState, useEffect } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  X,
  Heart,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Edit,
  Trash2,
  Instagram,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import { FollowButton } from "@/components/follow/follow-button";

interface PostDetailModalProps {
  post: any;
  userId: string;
  onClose: () => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onUpdate: () => void;
}

function safeUrl(url?: string | null) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function PostDetailModal({
  post,
  userId,
  onClose,
  onLike,
  onSave,
  onUpdate,
}: PostDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isLiked = post.likes?.some((like: any) => like.user_id === userId);
  const isSaved = post.saves?.some((save: any) => save.user_id === userId);
  const isOwner = post.user_id === userId;

  // Check follow state on mount
  useEffect(() => {
    if (userId && !isOwner && post.users?.id) {
      supabase
        .from("follows")
        .select("id")
        .match({ follower_id: userId, following_id: post.users.id })
        .single()
        .then(({ data }) => {
          setIsFollowingAuthor(!!data);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, post.users?.id]);

  const images =
    post.post_images?.sort((a: any, b: any) => a.order_index - b.order_index) ||
    [];

  const nextImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDelete = async () => {
    await supabase.from("posts").delete().eq("id", post.id);
    setShowDeleteDialog(false);
    onClose();
    onUpdate();
  };

  // ✅ New: separate links
  const brandWebsite = safeUrl(post.brand_website);
  const instagramUrl = safeUrl(post.brand_social_link); // treating this as Instagram

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[85vh] p-0 overflow-hidden bg-white border border-zinc-200 rounded-2xl shadow-xl">
          <VisuallyHidden>
            <DialogTitle>
              {post.brand ? `${post.brand} post details` : "Post details"}
            </DialogTitle>
          </VisuallyHidden>

          <div className="flex h-full bg-white">
            {/* Image Section */}
            <div className="flex-1 relative overflow-hidden bg-black">
              {images[currentImageIndex] && (
                <div className="relative w-full h-full bg-white">
                  <Image
                    src={images[currentImageIndex].image_url}
                    alt={`${post.brand} ${post.garment_type}`}
                    fill
                    className="object-cover"
                    sizes="60vw"
                  />
                </div>
              )}

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 backdrop-blur border border-zinc-200 text-zinc-700 hover:bg-white transition flex items-center justify-center"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 backdrop-blur border border-zinc-200 text-zinc-700 hover:bg-white transition flex items-center justify-center"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-zinc-900 w-8"
                          : "bg-zinc-300 w-2"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 backdrop-blur border border-zinc-200 text-zinc-700 hover:bg-white transition flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Sidebar */}
            <div className="w-[420px] border-l border-zinc-200 flex flex-col bg-white">
              {/* User info */}
              <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
                <Link
                  href={`/profile/${post.users?.id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="w-11 h-11 border border-zinc-200">
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
                      currentUserId={userId || null}
                      isFollowing={isFollowingAuthor}
                      onToggle={() => setIsFollowingAuthor(!isFollowingAuthor)}
                      size="sm"
                    />
                    <Link
                      href={`/messages?user=${post.users?.id}`}
                      className="h-9 w-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 transition"
                      aria-label="Message user"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 leading-tight">
                    {post.brand}
                  </h2>
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

                  {/* ✅ New: Brand website */}
                  {brandWebsite && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                        Brand Website
                      </span>
                      <a
                        href={brandWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block truncate"
                      >
                        {brandWebsite}
                      </a>
                    </div>
                  )}

                  {/* ✅ New: Instagram link */}
                  {instagramUrl && (
                    <div>
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-2 text-sm text-zinc-800 hover:underline"
                        aria-label="Open Instagram"
                      >
                        <Instagram className="w-4 h-4 text-zinc-700" />
                        Instagram
                      </a>
                      <a className="text-xs text-zinc-500 truncate mt-1">
                        {instagramUrl}
                      </a>
                    </div>
                  )}

                  {post.description && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                        Description
                      </span>
                      <p className="text-sm text-zinc-900 leading-relaxed">
                        {post.description}
                      </p>
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
              </div>

              {/* Actions */}
              <div className="px-6 py-5 border-t border-zinc-200 space-y-3 bg-white">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onLike(post.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 flex-1 justify-center rounded-full border text-sm transition ${
                      isLiked
                        ? "bg-zinc-900 border-zinc-900 text-white"
                        : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"
                    }`}
                    aria-label="Like"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                    <span className="font-ui font-semibold">
                      {post._count?.likes || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => onSave(post.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 flex-1 justify-center rounded-full border text-sm transition ${
                      isSaved
                        ? "bg-zinc-900 border-zinc-900 text-white"
                        : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"
                    }`}
                    aria-label="Save"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
                    />
                    <span className="font-ui font-semibold">
                      {post._count?.saves || 0}
                    </span>
                  </button>
                </div>

                {isOwner && (
                  <div className="flex gap-3">
                    <Link
                      href={`/edit/${post.id}`}
                      className="flex items-center gap-2 px-4 py-2.5 flex-1 justify-center rounded-full border border-zinc-200 text-sm text-zinc-800 hover:bg-zinc-50 transition"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      className="flex items-center gap-2 px-4 py-2.5 flex-1 justify-center rounded-full border border-red-200 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border border-zinc-200 rounded-2xl shadow-xl">
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
              className="rounded-full bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
