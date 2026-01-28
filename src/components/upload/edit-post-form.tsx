"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../../supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditPostFormProps {
  post: any;
  userId: string;
}

export function EditPostForm({ post, userId }: EditPostFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    brand: post.brand || "",
    garment_type: post.garment_type || "",
    color: post.color || "",
    size_fit: post.size_fit || "",
    brand_social_link: post.brand_social_link || "",
    description: post.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brand || !formData.garment_type || !formData.color) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("posts")
        .update({
          brand: formData.brand,
          garment_type: formData.garment_type,
          color: formData.color,
          size_fit: formData.size_fit || null,
          brand_social_link: formData.brand_social_link || null,
          description: formData.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      if (error) throw error;

      router.push("/profile");
    } catch (error: any) {
      console.error("Update error:", error);
      alert("Failed to update post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen noise-texture">
      <header className="border-b-[3px] border-foreground bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-ui font-semibold">Cancel</span>
          </Link>
          <h1 className="font-display text-2xl uppercase">Edit Post</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="brand" className="font-ui uppercase tracking-wide">
                Brand *
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., Nike, Vintage, Custom"
                className="border-[3px] border-foreground font-editorial text-lg"
                required
              />
            </div>

            <div>
              <Label htmlFor="garment_type" className="font-ui uppercase tracking-wide">
                Garment Type *
              </Label>
              <Input
                id="garment_type"
                value={formData.garment_type}
                onChange={(e) => setFormData({ ...formData, garment_type: e.target.value })}
                placeholder="e.g., Jacket, T-Shirt, Pants"
                className="border-[3px] border-foreground font-editorial text-lg"
                required
              />
            </div>

            <div>
              <Label htmlFor="color" className="font-ui uppercase tracking-wide">
                Color *
              </Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g., Black, Vintage Blue, Multi"
                className="border-[3px] border-foreground font-editorial text-lg"
                required
              />
            </div>

            <div>
              <Label htmlFor="size_fit" className="font-ui uppercase tracking-wide">
                Size / Fit
              </Label>
              <Input
                id="size_fit"
                value={formData.size_fit}
                onChange={(e) => setFormData({ ...formData, size_fit: e.target.value })}
                placeholder="e.g., Large, Oversized, Slim fit"
                className="border-[3px] border-foreground font-editorial text-lg"
              />
            </div>

            <div>
              <Label htmlFor="brand_social_link" className="font-ui uppercase tracking-wide">
                Brand Social Link
              </Label>
              <Input
                id="brand_social_link"
                value={formData.brand_social_link}
                onChange={(e) => setFormData({ ...formData, brand_social_link: e.target.value })}
                placeholder="https://instagram.com/brand"
                className="border-[3px] border-foreground font-editorial text-lg"
              />
            </div>

            <div>
              <Label htmlFor="description" className="font-ui uppercase tracking-wide">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Share the story behind this piece..."
                className="border-[3px] border-foreground font-editorial text-lg min-h-32"
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/profile"
              className="flex-1 py-4 border-[3px] border-foreground font-display text-xl uppercase tracking-wide hover:bg-muted transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !formData.brand || !formData.garment_type || !formData.color}
              className="flex-1 py-4 bg-accent text-primary font-display text-xl uppercase tracking-wide brutalist-border hover:translate-x-1 hover:translate-y-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
