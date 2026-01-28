"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/feed/post-card";
import { PostDetailModal } from "@/components/feed/post-detail-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Heart, Bookmark } from "lucide-react";
import Link from "next/link";

interface ProfileViewProps {
  userId: string;
  isOwnProfile: boolean;
}

export function ProfileView({ userId, isOwnProfile }: ProfileViewProps) {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const supabase = createClient();

  useEffect(() => {
    initUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadProfileData();
    }
  }, [userId, currentUserId]);

  const initUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const loadProfileData = async () => {
    setLoading(true);

    // Load user data
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    setUser(userData);

    // Load user's posts
    const { data: postsData } = await supabase
      .from("posts")
      .select(`
        *,
        users!posts_user_id_fkey (id, email, name, avatar_url),
        post_images (id, image_url, order_index),
        likes (id, user_id),
        saves (id, user_id)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (postsData) {
      const postsWithCounts = postsData.map((post: any) => ({
        ...post,
        _count: {
          likes: post.likes?.length || 0,
          saves: post.saves?.length || 0,
        },
      }));
      setPosts(postsWithCounts);
    }

    // Load saved posts if own profile
    if (isOwnProfile) {
      const { data: savesData } = await supabase
        .from("saves")
        .select(`
          post_id,
          posts (
            *,
            users!posts_user_id_fkey (id, email, name, avatar_url),
            post_images (id, image_url, order_index),
            likes (id, user_id),
            saves (id, user_id)
          )
        `)
        .eq("user_id", userId);

      if (savesData) {
        const savedPostsData = savesData
          .map((save: any) => save.posts)
          .filter(Boolean)
          .map((post: any) => ({
            ...post,
            _count: {
              likes: post.likes?.length || 0,
              saves: post.saves?.length || 0,
            },
          }));
        setSavedPosts(savedPostsData);
      }
    }

    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    if (!currentUserId) return;

    const allPosts = [...posts, ...savedPosts];
    const post = allPosts.find((p) => p.id === postId);
    const isLiked = post?.likes.some((like: any) => like.user_id === currentUserId);

    if (isLiked) {
      await supabase.from("likes").delete().match({ post_id: postId, user_id: currentUserId });
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: currentUserId });
    }

    loadProfileData();
  };

  const handleSave = async (postId: string) => {
    if (!currentUserId) return;

    const allPosts = [...posts, ...savedPosts];
    const post = allPosts.find((p) => p.id === postId);
    const isSaved = post?.saves.some((save: any) => save.user_id === currentUserId);

    if (isSaved) {
      await supabase.from("saves").delete().match({ post_id: postId, user_id: currentUserId });
    } else {
      await supabase.from("saves").insert({ post_id: postId, user_id: currentUserId });
    }

    loadProfileData();
  };

  if (loading) {
    return (
      <div className="min-h-screen noise-texture">
        <header className="border-b-[3px] border-foreground bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-ui font-semibold">Back</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-6 mb-12">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen noise-texture">
        <header className="border-b-[3px] border-foreground bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-ui font-semibold">Back to Feed</span>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          {/* Profile Header */}
          <div className="flex items-start gap-8 mb-12">
            <Avatar className="w-32 h-32 border-[3px] border-foreground">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-accent text-primary font-display text-4xl">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="font-display text-4xl uppercase mb-2">{user?.name || "Anonymous"}</h1>
                <p className="font-editorial text-lg opacity-70">{user?.email}</p>
              </div>

              <div className="flex gap-8 font-ui">
                <div>
                  <span className="text-2xl font-bold">{posts.length}</span>
                  <span className="ml-2 opacity-70">Posts</span>
                </div>
                {isOwnProfile && (
                  <div>
                    <span className="text-2xl font-bold">{savedPosts.length}</span>
                    <span className="ml-2 opacity-70">Saved</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b-[3px] border-foreground rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger
                value="posts"
                className="font-display text-xl uppercase px-8 py-4 rounded-none border-b-[3px] border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
              >
                <Heart className="w-5 h-5 mr-2" />
                Posts
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger
                  value="saved"
                  className="font-display text-xl uppercase px-8 py-4 rounded-none border-b-[3px] border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
                >
                  <Bookmark className="w-5 h-5 mr-2" />
                  Saved
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="posts" className="mt-8">
              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="font-editorial text-xl opacity-70">No posts yet</p>
                  {isOwnProfile && (
                    <Link
                      href="/upload"
                      className="inline-block mt-6 px-8 py-4 bg-accent text-primary font-display text-lg uppercase tracking-wide brutalist-border hover:translate-x-1 hover:translate-y-1 transition-transform"
                    >
                      Create First Post
                    </Link>
                  )}
                </div>
              ) : (
                <div
                  className="grid gap-6"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gridAutoRows: "10px",
                  }}
                >
                  {posts.map((post, index) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      userId={currentUserId}
                      onLike={handleLike}
                      onSave={handleSave}
                      onClick={() => setSelectedPost(post)}
                      style={{
                        gridRowEnd: `span ${Math.floor(Math.random() * 20) + 40}`,
                        animationDelay: `${index * 50}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {isOwnProfile && (
              <TabsContent value="saved" className="mt-8">
                {savedPosts.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="font-editorial text-xl opacity-70">
                      No saved posts yet
                    </p>
                  </div>
                ) : (
                  <div
                    className="grid gap-6"
                    style={{
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      gridAutoRows: "10px",
                    }}
                  >
                    {savedPosts.map((post, index) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        userId={userId}
                        onLike={handleLike}
                        onSave={handleSave}
                        onClick={() => setSelectedPost(post)}
                        style={{
                          gridRowEnd: `span ${Math.floor(Math.random() * 20) + 40}`,
                          animationDelay: `${index * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
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
    </>
  );
}
