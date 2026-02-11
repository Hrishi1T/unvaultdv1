"use client";

import { useMemo, useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import Image from "next/image";

interface PostCardProps {
  post: any;
  userId: string;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onClick: () => void;
  style?: React.CSSProperties;
  followingIds?: Set<string>;
  onFollow?: (targetUserId: string) => void;
}

export function PostCard({ post, userId, onLike, onSave, onClick, style, followingIds, onFollow }: PostCardProps) {
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
          <div className="text-xs text-zinc-500 mt-1 truncate flex items-center gap-1">
            <span>by {author}</span>
            {onFollow && userId && post.user_id !== userId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFollow(post.user_id);
                }}
                className={`ml-1 w-5 h-5 rounded-full inline-flex items-center justify-center transition-colors ${
                  followingIds?.has(post.user_id)
                    ? "text-zinc-500 hover:text-red-500"
                    : "text-zinc-400 hover:text-zinc-900"
                }`}
                aria-label={followingIds?.has(post.user_id) ? "Unfollow" : "Follow"}
              >
                {followingIds?.has(post.user_id) ? (
                  <UserCheck className="w-3.5 h-3.5" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
