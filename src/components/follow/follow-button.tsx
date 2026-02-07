"use client";

import { useState } from "react";
import { createClient } from "../../../supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string | null;
  isFollowing: boolean;
  /** Direct state setter for isFollowing (used from profile view) */
  setIsFollowing?: (v: boolean) => void;
  /** Direct state updater for follower count (used from profile view) */
  setFollowerCount?: (fn: (n: number) => number) => void;
  /** Callback fired after follow/unfollow completes */
  onToggle?: () => void | Promise<void>;
  /** Button size variant */
  size?: "default" | "sm";
}

export function FollowButton({
  targetUserId,
  isFollowing,
  setIsFollowing,
  setFollowerCount,
  currentUserId,
  onToggle,
  size = "default",
}: FollowButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Don't render if user is viewing their own content
  if (currentUserId === targetUserId) return null;

  async function handleClick() {
    if (!currentUserId) {
      router.push("/sign_in_auth/sign-in");
      return;
    }

    setLoading(true);

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .match({
          follower_id: currentUserId,
          following_id: targetUserId,
        });

      setIsFollowing?.(false);
      setFollowerCount?.((n) => Math.max(0, n - 1));
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: targetUserId,
      });

      setIsFollowing?.(true);
      setFollowerCount?.((n) => n + 1);
    }

    await onToggle?.();
    setLoading(false);
  }

  const isSmall = size === "sm";

  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size={isSmall ? "sm" : "default"}
      className={
        isSmall
          ? "h-8 px-4 text-xs rounded-full"
          : "w-full sm:w-auto rounded-full"
      }
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
