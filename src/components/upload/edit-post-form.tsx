"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Upload } from "lucide-react";
import Image from "next/image";
import { createClient } from "../../../supabase/client";

import { ListingFormFields, type ListingFormData } from "../upload/listing";

interface EditPostFormProps {
  post: any;
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);

  const sortedExisting = [...(post.post_images || [])].sort(
    (a: any, b: any) => a.order_index - b.order_index,
  );
  const [existingImages, setExistingImages] = useState<any[]>(sortedExisting);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<ListingFormData>({
    brand: post.brand || "",
    brand_website: post.brand_website || "",
    description: post.description || "",
    post_type: post.post_type || "live",
    event_date: post.event_date || "",
  });

  const normalizeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return null;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const isFilled = (value: string) => value.trim().length > 0;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const removeExisting = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setRemovedIds((prev) => new Set(prev).add(id));
  };

  const removeNew = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const totalImages = existingImages.length + newFiles.length;

  const handleSubmit = async () => {
    if (!isFilled(formData.brand) || !isFilled(formData.brand_website)) {
      alert("Please fill in all required fields (Brand Name, Brand Website).");
      return;
    }

    setSaving(true);

    try {
      // Delete removed images from DB
      if (removedIds.size > 0) {
        const { error } = await supabase
          .from("post_images")
          .delete()
          .in("id", [...removedIds]);
        if (error) throw error;
      }

      // Upload new images
      const userId = post.user_id;
      let orderStart = existingImages.length;

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(fileName);

        const { error: insertError } = await supabase
          .from("post_images")
          .insert({ post_id: post.id, image_url: publicUrl, order_index: orderStart + i });
        if (insertError) throw insertError;
      }

      // Update post fields
      const { error: postError } = await supabase
        .from("posts")
        .update({
          brand: formData.brand.trim(),
          brand_website: normalizeUrl(formData.brand_website),
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      if (postError) throw postError;

      router.push("/profile");
    } catch (error: any) {
      console.error("Update error:", error);
      alert("Failed to update post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canSave = isFilled(formData.brand) && isFilled(formData.brand_website);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">Edit listing</h1>
            <p className="mt-1 text-sm text-zinc-500">Update details.</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            {/* Photos */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-900">Photos</h2>
                <p className="text-xs text-zinc-500">{totalImages} image{totalImages !== 1 ? "s" : ""}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
                  >
                    <Image
                      src={img.image_url}
                      alt="Listing image"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExisting(img.id)}
                      className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 border border-zinc-200 hover:bg-white"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4 text-zinc-700" />
                    </button>
                  </div>
                ))}

                {newPreviews.map((url, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
                  >
                    <Image
                      src={url}
                      alt={`New image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNew(index)}
                      className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 border border-zinc-200 hover:bg-white"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4 text-zinc-700" />
                    </button>
                  </div>
                ))}

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
              </div>
            </section>

            <ListingFormFields formData={formData} setFormData={setFormData} />

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

          <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-semibold text-zinc-900">Checklist</div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              <li className={formData.brand ? "text-zinc-900" : ""}>
                {formData.brand ? "✓" : "•"} Brand name
              </li>
              <li className={formData.brand_website ? "text-zinc-900" : ""}>
                {formData.brand_website ? "✓" : "•"} Brand website
              </li>
              <li className="text-zinc-900">✓ Type ({formData.post_type})</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
