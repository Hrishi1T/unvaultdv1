"use client";

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
  const isLiked = post.likes?.some((like: any) => like.user_id === userId);
  const isSaved = post.saves?.some((save: any) => save.user_id === userId);
  const mainImage = post.post_images?.sort((a: any, b: any) => a.order_index - b.order_index)[0];

  return (
    <div
      className="group relative overflow-hidden border-[3px] border-foreground bg-card shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all duration-300 cursor-pointer fade-in"
      style={style}
      onClick={onClick}
    >
      <div className="relative w-full h-full overflow-hidden">
        {mainImage && (
          <Image
            src={mainImage.image_url}
            alt={`${post.brand} ${post.garment_type}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Metadata overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="text-secondary space-y-1">
            <h3 className="font-display text-xl uppercase">{post.brand}</h3>
            <p className="font-editorial text-sm opacity-90">
              {post.garment_type} · {post.color}
            </p>
            <p className="text-xs opacity-75 font-ui">by {post.users?.name || post.users?.email}</p>
          </div>
        </div>

        {/* Image count indicator */}
        {post.post_images?.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 text-xs font-ui text-secondary">
            1/{post.post_images.length}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(post.id);
          }}
          className={`p-2 rounded-full backdrop-blur-sm border-2 transition-all duration-200 ${
            isLiked
              ? "bg-accent border-accent text-primary scale-110"
              : "bg-black/50 border-secondary/50 text-secondary hover:bg-black/70"
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave(post.id);
          }}
          className={`p-2 rounded-full backdrop-blur-sm border-2 transition-all duration-200 ${
            isSaved
              ? "bg-accent border-accent text-primary scale-110"
              : "bg-black/50 border-secondary/50 text-secondary hover:bg-black/70"
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
}
