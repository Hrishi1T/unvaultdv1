"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Upload } from "lucide-react";
import Image from "next/image";
import { createClient } from "../../../supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UploadFormProps {
  userId: string;
}

export function UploadForm({ userId }: UploadFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    brand: "",
    garment_type: "",
    color: "",
    size_fit: "",
    brand_social_link: "",
    brand_website: "",
    description: "",
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    if (!formData.brand || !formData.garment_type || !formData.color) {
      alert("Please fill in all required fields (Brand, Garment Type, Color).");
      return;
    }

    setUploading(true);

    try {
      // Upload images to Supabase storage
      const imageUrls: { url: string; order: number }[] = [];

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(fileName);

        imageUrls.push({ url: publicUrl, order: i });
      }

      // Create post
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          brand: formData.brand,
          garment_type: formData.garment_type,
          color: formData.color,
          size_fit: formData.size_fit || null,
          brand_social_link: formData.brand_social_link || null,
          description: formData.description || null,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Insert images
      const { error: imagesError } = await supabase.from("post_images").insert(
        imageUrls.map((img) => ({
          post_id: post.id,
          image_url: img.url,
          order_index: img.order,
        })),
      );

      if (imagesError) throw imagesError;

      router.push("/");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Failed to publish. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const canPublish =
    images.length > 0 &&
    !!formData.brand &&
    !!formData.garment_type &&
    !!formData.color;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Page title (Grailed-like) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">
            Add a new listing
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Upload photos and details on one page.
          </p>
        </div>
      </div>

      {/* Two-column layout: form + sidebar */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        {/* LEFT */}
        <div className="space-y-10">
          {/* Photos */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900">Photos</h2>
              <p className="text-xs text-zinc-500">1–5 images</p>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
                >
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 border border-zinc-200 hover:bg-white"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4 text-zinc-700" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="aspect-square rounded-xl border border-dashed border-zinc-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors">
                  <Upload className="w-6 h-6 text-zinc-500" />
                  <span className="mt-2 text-sm text-zinc-600">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </section>

          {/* Details */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-base font-semibold text-zinc-900">Details</h2>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="brand"
                  className="text-xs font-medium text-zinc-700"
                >
                  Brand <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="brand"
                  required
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  placeholder="e.g., Nike, Vintage, Custom"
                  className="bg-white text-black placeholder:text-zinc-500 border border-zinc-300 focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="garment_type"
                  className="text-xs font-medium text-zinc-700"
                >
                  Garment Type <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="garment_type"
                  required
                  value={formData.garment_type}
                  onChange={(e) =>
                    setFormData({ ...formData, garment_type: e.target.value })
                  }
                  placeholder="e.g., Jacket, T-Shirt, Pants"
                  className="bg-white text-black placeholder:text-zinc-500 border border-zinc-300 focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="color"
                  className="text-xs font-medium text-zinc-700"
                >
                  Color <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="color"
                  required
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="e.g., Black, Vintage Blue, Multi"
                  className="bg-white text-black placeholder:text-zinc-500 border border-zinc-300 focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="size_fit"
                  className="text-xs font-medium text-zinc-700"
                >
                  Size / Fit
                </Label>
                <Input
                  id="size_fit"
                  value={formData.size_fit}
                  onChange={(e) =>
                    setFormData({ ...formData, size_fit: e.target.value })
                  }
                  placeholder="e.g., Large, Oversized, Slim fit"
                  className="bg-white text-black placeholder:text-zinc-500 border border-zinc-300 focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label
                  htmlFor="brand_social"
                  className="text-xs font-medium text-zinc-700"
                >
                  Brand Social Link <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="brand_social"
                  type="url"
                  required
                  value={formData.brand_social_link}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brand_social_link: e.target.value,
                    })
                  }
                  placeholder="https://instagram.com/brand"
                  className="bg-white text-black placeholder:text-zinc-500 border border-zinc-300 focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label
                  htmlFor="brand_website"
                  className="text-xs font-medium text-zinc-700"
                >
                  Brand Website <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="brand_website"
                  type="url"
                  required
                  value={formData.brand_website}
                  onChange={(e) =>
                    setFormData({ ...formData, brand_website: e.target.value })
                  }
                  placeholder="https://brand.com"
                  className="bg-white text-black placeholder:text-zinc-500 border border-zinc-300 focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label
                  htmlFor="description"
                  className="text-xs font-medium text-zinc-700"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Share the story behind this piece..."
                  className="bg-white text-black placeholder:text-zinc-500 border border-zinc-300 focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </section>

          {/* Sticky-ish action row like modern marketplaces */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-full border border-zinc-300 bg-white text-sm text-zinc-900 hover:bg-zinc-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canPublish || uploading}
              className="px-5 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        {/* RIGHT: sidebar */}
        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-semibold text-zinc-900">Checklist</div>

          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li className={images.length ? "text-zinc-900" : ""}>
              {images.length ? "✓" : "•"} Add at least 1 photo
            </li>
            <li className={formData.brand ? "text-zinc-900" : ""}>
              {formData.brand ? "✓" : "•"} Brand
            </li>
            <li className={formData.garment_type ? "text-zinc-900" : ""}>
              {formData.garment_type ? "✓" : "•"} Garment type
            </li>
            <li className={formData.color ? "text-zinc-900" : ""}>
              {formData.color ? "✓" : "•"} Color
            </li>
          </ul>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
            Tip: Use 3–5 photos with good lighting. First image becomes the
            cover.
          </div>
        </aside>
      </div>
    </div>
  );
}
