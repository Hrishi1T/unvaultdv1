"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { createClient } from "../../../supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow/follow-button";
import { Skeleton } from "@/components/ui/skeleton";

interface FollowUser {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface FollowListModalProps {
  userId: string;
  currentUserId: string | null;
  type: "followers" | "following";
  onClose: () => void;
  onFollowChange?: () => void;
}

export function FollowListModal({
  userId,
  currentUserId,
  type,
  onClose,
  onFollowChange,
}: FollowListModalProps) {
  const supabase = createClient();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, type]);

  const loadUsers = async () => {
    setLoading(true);

    if (type === "followers") {
      // Get users who follow this profile
      const { data } = await supabase
        .from("follows")
        .select("follower_id, users!follows_follower_id_fkey (id, name, username, avatar_url)")
        .eq("following_id", userId);

      const list = (data || [])
        .map((row: any) => row.users)
        .filter(Boolean) as FollowUser[];
      setUsers(list);
    } else {
      // Get users this profile follows
      const { data } = await supabase
        .from("follows")
        .select("following_id, users!follows_following_id_fkey (id, name, username, avatar_url)")
        .eq("follower_id", userId);

      const list = (data || [])
        .map((row: any) => row.users)
        .filter(Boolean) as FollowUser[];
      setUsers(list);
    }

    // Get who the current user is following (for button state)
    if (currentUserId) {
      const { data: myFollows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUserId);

      const ids = new Set((myFollows || []).map((f: any) => f.following_id));
      setFollowingIds(ids);
    }

    setLoading(false);
  };

  const handleFollowToggle = () => {
    loadUsers();
    onFollowChange?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 shrink-0">
          <h2 className="text-lg font-semibold text-zinc-900 capitalize">
            {type}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-500">
                {type === "followers"
                  ? "No followers yet"
                  : "Not following anyone yet"}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <Link
                    href={`/profile/${u.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <Avatar className="h-10 w-10 border border-zinc-200">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback className="bg-zinc-100 text-zinc-800 text-sm font-medium">
                        {(u.name?.[0] || u.username?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {u.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        @{u.username || `user_${u.id.slice(0, 8)}`}
                      </p>
                    </div>
                  </Link>

                  {currentUserId && currentUserId !== u.id && (
                    <FollowButton
                      targetUserId={u.id}
                      currentUserId={currentUserId}
                      isFollowing={followingIds.has(u.id)}
                      onToggle={handleFollowToggle}
                      size="sm"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
