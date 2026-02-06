"use client";

import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string | null;
  isFollowing: boolean;
  onToggle?: () => void;
  size?: "sm" | "md";
  variant?: "default" | "inline";
}

export function FollowButton({
  targetUserId,
  currentUserId,
  isFollowing: initialFollowing,
  onToggle,
  size = "md",
  variant = "default",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Don't show follow button for own profile
  if (currentUserId === targetUserId) return null;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      router.push("/sign_in_auth/sign-in");
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .match({ follower_id: currentUserId, following_id: targetUserId });
        setIsFollowing(false);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: targetUserId });
        setIsFollowing(true);
      }
      onToggle?.();
    } catch (error) {
      console.error("Follow toggle error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs gap-1.5"
      : "px-4 py-2 text-sm gap-2";

  const baseClasses = `inline-flex items-center justify-center rounded-full border font-medium transition-all duration-200 disabled:opacity-50 ${sizeClasses}`;

  const stateClasses = isFollowing
    ? "bg-white border-zinc-300 text-zinc-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
    : "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800";

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${baseClasses} ${stateClasses}`}
    >
      {isFollowing ? (
        <>
          <UserCheck className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
