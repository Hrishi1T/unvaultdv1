"use client";

import { useState } from "react";
import { X, Heart, Bookmark, ChevronLeft, ChevronRight, MessageCircle, Edit, Trash2 } from "lucide-react";
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

interface PostDetailModalProps {
  post: any;
  userId: string;
  onClose: () => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onUpdate: () => void;
}

export function PostDetailModal({ post, userId, onClose, onLike, onSave, onUpdate }: PostDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isLiked = post.likes?.some((like: any) => like.user_id === userId);
  const isSaved = post.saves?.some((save: any) => save.user_id === userId);
  const isOwner = post.user_id === userId;
  const images = post.post_images?.sort((a: any, b: any) => a.order_index - b.order_index) || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDelete = async () => {
    await supabase.from("posts").delete().eq("id", post.id);
    setShowDeleteDialog(false);
    onClose();
    onUpdate();
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 border-[3px] border-foreground bg-background overflow-hidden">
          <div className="flex h-full">
            {/* Image Section */}
            <div className="flex-1 relative bg-muted flex items-center justify-center">
              {images[currentImageIndex] && (
                <div className="relative w-full h-full">
                  <Image
                    src={images[currentImageIndex].image_url}
                    alt={`${post.brand} ${post.garment_type}`}
                    fill
                    className="object-contain"
                    sizes="60vw"
                  />
                </div>
              )}

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/70 backdrop-blur-sm border-2 border-secondary/50 text-secondary hover:bg-black/90 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/70 backdrop-blur-sm border-2 border-secondary/50 text-secondary hover:bg-black/90 transition-all"
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
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? "bg-accent w-8" : "bg-secondary/50"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/70 backdrop-blur-sm border-2 border-secondary/50 text-secondary hover:bg-black/90 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Metadata Sidebar */}
            <div className="w-[400px] border-l-[3px] border-foreground flex flex-col">
              {/* User info */}
              <div className="p-6 border-b-[3px] border-foreground flex items-center justify-between">
                <Link href={`/profile/${post.users?.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Avatar className="w-12 h-12 border-2 border-foreground">
                    <AvatarImage src={post.users?.avatar_url} />
                    <AvatarFallback className="bg-accent text-primary font-display">
                      {post.users?.name?.charAt(0)?.toUpperCase() || post.users?.email?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-ui font-semibold">{post.users?.name || "Anonymous"}</p>
                    <p className="text-sm opacity-70">{post.users?.email}</p>
                  </div>
                </Link>

                {!isOwner && (
                  <Link
                    href={`/messages?user=${post.users?.id}`}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Link>
                )}
              </div>

              {/* Metadata */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h2 className="font-display text-3xl uppercase mb-2">{post.brand}</h2>
                  <p className="font-editorial text-lg opacity-90">{post.garment_type}</p>
                </div>

                <div className="space-y-3 font-editorial">
                  <div>
                    <span className="text-sm uppercase font-ui opacity-70">Color</span>
                    <p className="text-lg">{post.color}</p>
                  </div>

                  {post.size_fit && (
                    <div>
                      <span className="text-sm uppercase font-ui opacity-70">Size / Fit</span>
                      <p className="text-lg">{post.size_fit}</p>
                    </div>
                  )}

                  {post.brand_social_link && (
                    <div>
                      <span className="text-sm uppercase font-ui opacity-70">Brand Link</span>
                      <a
                        href={post.brand_social_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg text-accent hover:underline block truncate"
                      >
                        {post.brand_social_link}
                      </a>
                    </div>
                  )}

                  {post.description && (
                    <div>
                      <span className="text-sm uppercase font-ui opacity-70">Description</span>
                      <p className="text-lg leading-relaxed">{post.description}</p>
                    </div>
                  )}
                </div>

                <div className="text-sm font-ui opacity-50">
                  Posted {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t-[3px] border-foreground space-y-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onLike(post.id)}
                    className={`flex items-center gap-2 px-6 py-3 flex-1 justify-center border-[3px] transition-all duration-200 ${
                      isLiked
                        ? "bg-accent border-accent text-primary scale-105"
                        : "border-foreground hover:bg-muted"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                    <span className="font-ui font-semibold">{post._count?.likes || 0}</span>
                  </button>

                  <button
                    onClick={() => onSave(post.id)}
                    className={`flex items-center gap-2 px-6 py-3 flex-1 justify-center border-[3px] transition-all duration-200 ${
                      isSaved
                        ? "bg-accent border-accent text-primary scale-105"
                        : "border-foreground hover:bg-muted"
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                    <span className="font-ui font-semibold">{post._count?.saves || 0}</span>
                  </button>
                </div>

                {isOwner && (
                  <div className="flex gap-3">
                    <Link
                      href={`/edit/${post.id}`}
                      className="flex items-center gap-2 px-4 py-3 flex-1 justify-center border-[3px] border-foreground hover:bg-muted transition-colors font-ui"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      className="flex items-center gap-2 px-4 py-3 flex-1 justify-center border-[3px] border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors font-ui"
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
        <AlertDialogContent className="border-[3px] border-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl">Delete Post?</AlertDialogTitle>
            <AlertDialogDescription className="font-editorial text-base">
              This action cannot be undone. This will permanently delete your post and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[3px] border-foreground font-ui">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="border-[3px] border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 font-ui"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
