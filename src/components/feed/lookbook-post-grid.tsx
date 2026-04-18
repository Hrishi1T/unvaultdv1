"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@/components/ui/dialog";
import { createClient } from "../../../supabase/client";
import { openSignInModal } from "@/lib/open-sign-in-modal";
import { useRouter } from "next/navigation";

interface PostImage {
  id: string;
  image_url: string;
  order_index: number;
}

interface Post {
  id: string;
  brand: string;
  brand_website?: string | null;
  description?: string | null;
  post_images: PostImage[];
  likes?: { user_id: string }[];
  _count?: { likes: number };
}

interface LookbookPostGridProps {
  posts: Post[];
  userId: string | null;
}

function safeUrl(url?: string | null) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function LookbookPostGrid({ posts: initialPosts, userId }: LookbookPostGridProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const openPost = (post: Post) => {
    setSelectedPost(post);
    setCurrentImageIndex(0);
  };

  const closePost = () => {
    setSelectedPost(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (!selectedPost) return;
    const images = selectedPost.post_images;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!selectedPost) return;
    const images = selectedPost.post_images;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleLike = useCallback(
    async (postId: string) => {
      if (!userId) {
        const opened = openSignInModal();
        if (!opened) router.push("/sign_in_auth/sign-in");
        return;
      }

      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      const isLiked = post.likes?.some((l) => l.user_id === userId);

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const newLikes = isLiked
            ? (p.likes || []).filter((l) => l.user_id !== userId)
            : [...(p.likes || []), { user_id: userId }];
          const newCount = isLiked
            ? Math.max(0, (p._count?.likes || 0) - 1)
            : (p._count?.likes || 0) + 1;
          return { ...p, likes: newLikes, _count: { ...p._count, likes: newCount } };
        })
      );

      // Also update selectedPost if open
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => {
          if (!prev) return prev;
          const newLikes = isLiked
            ? (prev.likes || []).filter((l) => l.user_id !== userId)
            : [...(prev.likes || []), { user_id: userId }];
          const newCount = isLiked
            ? Math.max(0, (prev._count?.likes || 0) - 1)
            : (prev._count?.likes || 0) + 1;
          return { ...prev, likes: newLikes, _count: { ...prev._count, likes: newCount } };
        });
      }

      if (isLiked) {
        await supabase
          .from("likes")
          .delete()
          .match({ post_id: postId, user_id: userId });
      } else {
        await supabase.from("likes").insert({ post_id: postId, user_id: userId });
      }
    },
    [posts, userId, selectedPost, router, supabase]
  );

  return (
    <>
      <div className="space-y-20">
        {posts.map((post) => {
          const isLiked = post.likes?.some((l) => l.user_id === userId);
          const likeCount = post._count?.likes || 0;
          return (
            <div key={post.id} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-800">
                  {post.brand}
                </h2>
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition ${
                    isLiked
                      ? "bg-zinc-900 border-zinc-900 text-white"
                      : "border-zinc-300 text-zinc-600 hover:bg-zinc-50"
                  }`}
                  aria-label="Like post"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  <span className="font-medium">{likeCount}</span>
                </button>
              </div>
              <div className="flex flex-row flex-wrap gap-3">
                {post.post_images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => openPost(post)}
                    className="relative w-36 h-36 sm:w-44 sm:h-44 overflow-hidden bg-zinc-100 shrink-0 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                    aria-label={`View ${post.brand} post`}
                  >
                    <Image
                      src={img.image_url}
                      alt={post.brand}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 144px, 176px"
                    />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedPost && (
        <Dialog open={true} onOpenChange={closePost}>
          <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden bg-white border border-zinc-200 rounded-2xl shadow-xl">
            <VisuallyHidden>
              <DialogTitle>
                {selectedPost.brand ? `${selectedPost.brand} post details` : "Post details"}
              </DialogTitle>
            </VisuallyHidden>

            <div className="flex h-full flex-col md:flex-row bg-white">
              {/* Image Section */}
              <div className="relative w-full h-[56%] min-h-[280px] overflow-hidden bg-zinc-100 md:h-full md:min-h-0 md:w-3/5">
                {selectedPost.post_images[currentImageIndex] && (
                  <div className="relative w-full h-full bg-zinc-100">
                    <Image
                      src={selectedPost.post_images[currentImageIndex].image_url}
                      alt={selectedPost.brand}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                  </div>
                )}

                {/* Navigation arrows */}
                {selectedPost.post_images.length > 1 && (
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
                {selectedPost.post_images.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {selectedPost.post_images.map((_: any, index: number) => (
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
                  onClick={closePost}
                  className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 backdrop-blur border border-zinc-200 text-zinc-700 hover:bg-white transition flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar */}
              <div className="w-full h-[44%] border-t border-zinc-200 flex flex-col bg-white min-h-0 md:h-full md:w-2/5 md:border-t-0 md:border-l">
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                  <h2 className="text-xl font-semibold text-zinc-900 leading-tight">
                    {selectedPost.brand}
                  </h2>

                  {safeUrl(selectedPost.brand_website) && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                        Brand Website
                      </span>
                      <a
                        href={safeUrl(selectedPost.brand_website)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block truncate"
                      >
                        {safeUrl(selectedPost.brand_website)}
                      </a>
                    </div>
                  )}

                  {selectedPost.description && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                        Description
                      </span>
                      <p className="text-sm text-zinc-900 leading-relaxed mt-1">
                        {selectedPost.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Like action */}
                <div className="px-6 py-5 border-t border-zinc-200 bg-white">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 w-full justify-center rounded-full border text-sm transition ${
                      selectedPost.likes?.some((l) => l.user_id === userId)
                        ? "bg-zinc-900 border-zinc-900 text-white"
                        : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"
                    }`}
                    aria-label="Like"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        selectedPost.likes?.some((l) => l.user_id === userId)
                          ? "fill-current"
                          : ""
                      }`}
                    />
                    <span className="font-semibold">
                      {selectedPost._count?.likes || 0}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
