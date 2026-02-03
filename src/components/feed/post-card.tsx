"use client";

import { useMemo, useState } from "react";
import { Heart, Bookmark } from "lucide-react";
import Image from "next/image";

interface PostCardProps {
  post: any;
  userId: string;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onClick: () => void;
  style?: React.CSSProperties;
}

export function PostCard({ post, userId, onLike, onSave, onClick, style }: PostCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const isLiked = post.likes?.some((like: any) => like.user_id === userId);
  const isSaved = post.saves?.some((save: any) => save.user_id === userId);

  const mainImage = useMemo(() => {
    const imgs = post.post_images?.slice()?.sort((a: any, b: any) => a.order_index - b.order_index);
    return imgs?.[0];
  }, [post.post_images]);

  const author =
  (post.users?.username ? `@${post.users.username}` : null) ||
  post.users?.name ||
  post.users?.email ||
  "Anonymous";


  return (
    <div
      className="group relative rounded-lg border border-zinc-200 bg-white overflow-hidden cursor-pointer"
      style={style}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-square bg-white overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage.image_url}
            alt={`${post.brand} ${post.garment_type}`}
            fill
            className={`object-cover object-center transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoadingComplete={() => setImgLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-100" />
        )}

        {/* Image count badge (minimal) */}
        {post.post_images?.length > 1 && (
          <div className="absolute top-3 right-3 rounded-full border border-zinc-200 bg-white/90 backdrop-blur px-2 py-1 text-[11px] text-zinc-700">
            1/{post.post_images.length}
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className="p-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-zinc-900 truncate">
            {post.brand || "Brand"}
          </div>
          <div className="text-xs text-zinc-600 truncate">
            {post.garment_type}
            {post.color ? ` · ${post.color}` : ""}
          </div>
          <div className="text-xs text-zinc-500 mt-1 truncate">by {author}</div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
            className={`w-9 h-9 rounded-full border transition-colors grid place-items-center ${
              isLiked
                ? "bg-black text-white border-black"
                : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
            }`}
            aria-label="Like"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(post.id);
            }}
            className={`w-9 h-9 rounded-full border transition-colors grid place-items-center ${
              isSaved
                ? "bg-black text-white border-black"
                : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
            }`}
            aria-label="Save"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
