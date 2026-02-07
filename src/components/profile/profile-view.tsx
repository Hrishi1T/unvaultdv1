"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "../../../supabase/client";
import { FeedHeader } from "@/components/feed/feed-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard } from "@/components/feed/post-card";
import { PostDetailModal } from "@/components/feed/post-detail-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserIcon } from "@supabase/supabase-js";
import { Pencil, X, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FollowButton } from "@/components/follow/follow-button";
import { FollowListModal } from "@/components/follow/follow-list-modal";

type AnyPost = any;

interface ProfileViewProps {
  userId: string;
  isOwnProfile: boolean;
}

export function ProfileView({ userId, isOwnProfile }: ProfileViewProps) {
  const supabase = createClient();

  const [authUser, setAuthUser] = useState<UserIcon | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [user, setUser] = useState<any>(null);

  const [posts, setPosts] = useState<AnyPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<AnyPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<AnyPost[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<AnyPost | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "likes" | "saved">(
    "posts",
  );

  // Follow state
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followListType, setFollowListType] = useState<"followers" | "following" | null>(null);

  // Edit profile state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate username cooldown (14 days)
  const canChangeUsername = useMemo(() => {
    if (!user?.username_changed_at) return true;
    const lastChanged = new Date(user.username_changed_at);
    const cooldownEnd = new Date(lastChanged.getTime() + 14 * 24 * 60 * 60 * 1000);
    return new Date() >= cooldownEnd;
  }, [user?.username_changed_at]);

  const daysUntilUsernameChange = useMemo(() => {
    if (!user?.username_changed_at) return 0;
    const lastChanged = new Date(user.username_changed_at);
    const cooldownEnd = new Date(lastChanged.getTime() + 14 * 24 * 60 * 60 * 1000);
    const now = new Date();
    if (now >= cooldownEnd) return 0;
    return Math.ceil((cooldownEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  }, [user?.username_changed_at]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setAuthUser(data.user);
        setCurrentUserId(data.user.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUserId]);

  const normalizePosts = (rows: any[] | null | undefined) => {
    if (!rows) return [];
    return rows.map((post: any) => ({
      ...post,
      _count: {
        likes: post.likes?.length || 0,
        saves: post.saves?.length || 0,
      },
    }));
  };

  const loadProfileData = async () => {
    setLoading(true);

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    setUser(userData);

    // Posts
    const { data: postsData } = await supabase
      .from("posts")
      .select(
        `
        *,
        users!posts_user_id_fkey (id, email, name, username, avatar_url),
        post_images (id, image_url, order_index),
        likes (id, user_id),
        saves (id, user_id)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setPosts(normalizePosts(postsData));

    // Saved (own profile only)
    if (isOwnProfile) {
      const { data: savesData } = await supabase
        .from("saves")
        .select(
          `
          post_id,
          posts (
            *,
            users!posts_user_id_fkey (id, email, name, username, avatar_url),
            post_images (id, image_url, order_index),
            likes (id, user_id),
            saves (id, user_id)
          )
        `,
        )
        .eq("user_id", userId);

      const saved = (savesData || []).map((s: any) => s.posts).filter(Boolean);

      setSavedPosts(normalizePosts(saved));

      // Likes (own profile only) — Depop-like “Likes” tab
      const { data: likesData } = await supabase
        .from("likes")
        .select(
          `
          post_id,
          posts (
            *,
            users!posts_user_id_fkey (id, email, name, username, avatar_url),
            post_images (id, image_url, order_index),
            likes (id, user_id),
            saves (id, user_id)
          )
        `,
        )
        .eq("user_id", userId);

      const liked = (likesData || []).map((l: any) => l.posts).filter(Boolean);

      setLikedPosts(normalizePosts(liked));
    } else {
      setSavedPosts([]);
      setLikedPosts([]);
      setActiveTab("posts");
    }

    // Load follow counts
    const { count: followers } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);
    setFollowerCount(followers || 0);

    const { count: following } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);
    setFollowingCount(following || 0);

    // Check if current user follows this profile
    if (currentUserId && currentUserId !== userId) {
      const { data: followRow } = await supabase
        .from("follows")
        .select("id")
        .match({ follower_id: currentUserId, following_id: userId })
        .single();
      setIsFollowingUser(!!followRow);
    }

    setLoading(false);
  };

  const openEditModal = () => {
    setEditDisplayName(user?.name || "");
    setEditUsername(user?.username || "");
    setEditError("");
    setUsernameError("");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditError("");
    setUsernameError("");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      // Refresh profile data
      await loadProfileData();
    } catch (error: any) {
      setEditError(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const validateUsername = (username: string) => {
    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be 20 characters or less";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";
    return "";
  };

  const handleSaveProfile = async () => {
    if (!currentUserId) return;

    setEditError("");
    setUsernameError("");
    setIsSaving(true);

    try {
      const updates: any = {};
      
      // Always allow display name change
      if (editDisplayName !== user?.name) {
        updates.name = editDisplayName.trim() || null;
      }

      // Check username change
      const usernameChanged = editUsername.trim().toLowerCase() !== (user?.username || "").toLowerCase();
      
      if (usernameChanged) {
        if (!canChangeUsername) {
          setUsernameError(`You can only change your username once every 14 days. ${daysUntilUsernameChange} day(s) remaining.`);
          setIsSaving(false);
          return;
        }

        const validationError = validateUsername(editUsername);
        if (validationError) {
          setUsernameError(validationError);
          setIsSaving(false);
          return;
        }

        // Check if username is taken
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("username", editUsername.trim().toLowerCase())
          .neq("id", currentUserId)
          .single();

        if (existingUser) {
          setUsernameError("This username is already taken");
          setIsSaving(false);
          return;
        }

        updates.username = editUsername.trim().toLowerCase();
        updates.username_changed_at = new Date().toISOString();
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("users")
          .update(updates)
          .eq("id", currentUserId);

        if (error) throw error;
      }

      await loadProfileData();
      closeEditModal();
    } catch (error: any) {
      setEditError(error.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUserId) return;

    const all = [...posts, ...savedPosts, ...likedPosts];
    const post = all.find((p) => p.id === postId);
    const isLiked = post?.likes?.some(
      (like: any) => like.user_id === currentUserId,
    );

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .match({ post_id: postId, user_id: currentUserId });
    } else {
      await supabase
        .from("likes")
        .insert({ post_id: postId, user_id: currentUserId });
    }

    loadProfileData();
  };

  const handleSave = async (postId: string) => {
    if (!currentUserId) return;

    const all = [...posts, ...savedPosts, ...likedPosts];
    const post = all.find((p) => p.id === postId);
    const isSaved = post?.saves?.some((s: any) => s.user_id === currentUserId);

    if (isSaved) {
      await supabase
        .from("saves")
        .delete()
        .match({ post_id: postId, user_id: currentUserId });
    } else {
      await supabase
        .from("saves")
        .insert({ post_id: postId, user_id: currentUserId });
    }

    loadProfileData();
  };

  const tabItems = useMemo(() => {
    const base: Array<{
      key: "posts" | "likes" | "saved";
      label: string;
      count: number;
      show: boolean;
    }> = [
      { key: "posts", label: "Posts", count: posts.length, show: true },
      {
        key: "likes",
        label: "Likes",
        count: likedPosts.length,
        show: isOwnProfile,
      },
      {
        key: "saved",
        label: "Saves",
        count: savedPosts.length,
        show: isOwnProfile,
      },
    ];
    return base.filter((t) => t.show);
  }, [posts.length, likedPosts.length, savedPosts.length, isOwnProfile]);

  const activeList =
    activeTab === "posts"
      ? posts
      : activeTab === "likes"
        ? likedPosts
        : savedPosts;

  const avatarUrl = user?.avatar_url || "";
  const name = user?.name || "Anonymous";
  const username = user?.username || `user_${userId.slice(0, 8)}`;
  const email = user?.email || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <FeedHeader user={authUser} />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-start gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-8 pt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
  {/* Match Image 1 header */}
  <FeedHeader user={authUser} profile={user} />

  <div className="mx-auto max-w-6xl px-4 py-10">
    {/* Depop-like profile header (Image 2 structure) */}
    <section className="flex items-start gap-6">
      <div className="relative group">
        <Avatar className="h-20 w-20 border border-zinc-300">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-zinc-100 text-zinc-900 font-display">
            {(name?.[0] || username?.[0] || "U").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isOwnProfile && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
          </>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-zinc-900">{name}</h1>
              {isOwnProfile && (
                <button
                  onClick={openEditModal}
                  className="p-1 rounded-full hover:bg-zinc-100 transition-colors"
                  title="Edit profile"
                >
                  <Pencil className="h-4 w-4 text-zinc-500" />
                </button>
              )}
            </div>
            <p className="text-sm text-zinc-600">@{username}</p>
            <p className="text-xs text-zinc-500 mt-1">Active today</p>
          </div>

          {isOwnProfile && (
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 bg-white text-sm text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              List an item
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-6 mt-4 text-sm text-zinc-700">
          <span>
            <span className="font-semibold text-zinc-900">{posts.length}</span>{" "}
            Posts
          </span>
          <button
            onClick={() => setFollowListType("followers")}
            className="hover:underline"
          >
            <span className="font-semibold text-zinc-900">{followerCount}</span>{" "}
            Followers
          </button>
          <button
            onClick={() => setFollowListType("following")}
            className="hover:underline"
          >
            <span className="font-semibold text-zinc-900">{followingCount}</span>{" "}
            Following
          </button>
        </div>

        {/* Follow button for other users' profiles */}
        {!isOwnProfile && currentUserId && (
          <div className="mt-4">
            <FollowButton
              targetUserId={userId}
              currentUserId={currentUserId}
              isFollowing={isFollowingUser}
              setIsFollowing={setIsFollowingUser}
              setFollowerCount={setFollowerCount}
            />
          </div>
        )}

        {/* Tabs + Content constrained to match the post card column */}
        <div className="mt-6 w-full">
          {/* Tabs */}
          <div className="border-b border-zinc-200">
            <div className="flex gap-8">
              {tabItems.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={[
                    "pb-3 text-sm font-medium",
                    activeTab === t.key
                      ? "text-zinc-900 border-b-2 border-zinc-900"
                      : "text-zinc-500 hover:text-zinc-800",
                  ].join(" ")}
                >
                  {t.label}
                  <span className="ml-2 text-xs text-zinc-400">({t.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content (moved inside the same constrained wrapper so the divider/section doesn't extend) */}
          <div className="mt-6">
            {activeList.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-8 text-center">
                <div className="text-zinc-900 text-base font-medium">
                  {activeTab === "posts"
                    ? "Start listing today"
                    : activeTab === "likes"
                    ? "No likes yet"
                    : "No saves yet"}
                </div>

                {isOwnProfile && activeTab === "posts" && (
                  <Link
                    href="/upload"
                    className="inline-flex mt-5 items-center justify-center px-5 py-2 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800"
                  >
                    List an item
                  </Link>
                )}
              </div>
            ) : (
              // Single-column stack that matches the constrained width
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {activeList.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userId={currentUserId}
                    onLike={handleLike}
                    onSave={handleSave}
                    onClick={() => setSelectedPost(post)}
                    style={{
                      animationDelay: `${index * 40}ms`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  </div>
</div>


      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          userId={currentUserId}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onSave={handleSave}
          onUpdate={loadProfileData}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-zinc-900">Edit Profile</h2>
              <button
                onClick={closeEditModal}
                className="p-1 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {editError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium text-zinc-700">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full"
                />
                <p className="text-xs text-zinc-500">
                  This can be changed at any time.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-zinc-700">
                  Username
                </Label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-zinc-100 border border-r-0 border-zinc-300 rounded-l-md text-zinc-500 text-sm">
                    @
                  </span>
                  <Input
                    id="username"
                    type="text"
                    value={editUsername}
                    onChange={(e) => {
                      setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                      setUsernameError("");
                    }}
                    placeholder="username"
                    className="rounded-l-none"
                    disabled={!canChangeUsername}
                  />
                </div>
                {usernameError && (
                  <div className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <span>{usernameError}</span>
                  </div>
                )}
                {!canChangeUsername && !usernameError && (
                  <div className="flex items-center gap-1 text-amber-600 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <span>Username can only be changed once every 14 days. {daysUntilUsernameChange} day(s) remaining.</span>
                  </div>
                )}
                {canChangeUsername && (
                  <p className="text-xs text-zinc-500">
                    This can only be changed once every 14 days.
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow List Modal */}
      {followListType && (
        <FollowListModal
          userId={userId}
          currentUserId={currentUserId}
          type={followListType}
          onClose={() => setFollowListType(null)}
          onFollowChange={loadProfileData}
        />
      )}
    </>
  );
}
