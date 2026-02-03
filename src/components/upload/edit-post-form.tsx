"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../supabase/client";

// ✅ Shared fields (same UI as upload)
import { ListingFormFields, type ListingFormData } from "../upload/listing";

interface EditPostFormProps {
  post: any;
  userId: string;
}

export function EditPostForm({ post, userId }: EditPostFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<ListingFormData>({
    brand: post.brand || "",
    garment_type: post.garment_type || "",
    color: post.color || "",
    size_fit: post.size_fit || "",
    brand_social_link: post.brand_social_link || "",
    brand_website: post.brand_website || "",
    description: post.description || "",
  });

  const normalizeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return null;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const handleSubmit = async () => {
    if (
      !formData.brand ||
      !formData.garment_type ||
      !formData.color ||
      !formData.brand_social_link ||
      !formData.brand_website
    ) {
      alert(
        "Please fill in all required fields (Brand, Garment Type, Color, Brand Social Link, Brand Website).",
      );
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

          brand_social_link: formData.brand_social_link
            ? normalizeUrl(formData.brand_social_link)
            : null,

          brand_website: formData.brand_website
            ? normalizeUrl(formData.brand_website)
            : null,

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

  const canSave =
    !!formData.brand &&
    !!formData.garment_type &&
    !!formData.color &&
    !!formData.brand_social_link &&
    !!formData.brand_website;

 return (
  <div className="min-h-screen bg-white">
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Page title (match upload) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">
            Edit listing
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Update details.
          </p>
        </div>
      </div>

      {/* Two-column layout: form + sidebar */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        {/* LEFT */}
        <div className="space-y-10">
          {/* Details (shared component - EXACT same as upload) */}
          <ListingFormFields
            formData={formData}
            setFormData={setFormData}
          />

          {/* Sticky-ish action row like upload */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="px-4 py-2 rounded-full border border-zinc-300 bg-white text-sm text-zinc-900 hover:bg-zinc-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSave || saving}
              className="px-5 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {/* RIGHT: sidebar (match upload) */}
        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-semibold text-zinc-900">Checklist</div>

          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li className={formData.brand ? "text-zinc-900" : ""}>
              {formData.brand ? "✓" : "•"} Brand
            </li>
            <li className={formData.garment_type ? "text-zinc-900" : ""}>
              {formData.garment_type ? "✓" : "•"} Garment type
            </li>
            <li className={formData.color ? "text-zinc-900" : ""}>
              {formData.color ? "✓" : "•"} Color
            </li>
            <li className={formData.brand_social_link ? "text-zinc-900" : ""}>
              {formData.brand_social_link ? "✓" : "•"} Brand social link
            </li>
            <li className={formData.brand_website ? "text-zinc-900" : ""}>
              {formData.brand_website ? "✓" : "•"} Brand website
            </li>
          </ul>

        </aside>
      </div>
    </div>
  </div>
);

}
