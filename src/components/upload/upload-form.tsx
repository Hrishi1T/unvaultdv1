"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Upload, Image as ImageIcon, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
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
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    brand: "",
    garment_type: "",
    color: "",
    size_fit: "",
    brand_social_link: "",
    description: "",
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setImages([...images, ...files]);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...urls]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    if (!formData.brand || !formData.garment_type || !formData.color) {
      alert("Please fill in all required fields");
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

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);

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
      const { error: imagesError } = await supabase
        .from("post_images")
        .insert(
          imageUrls.map((img) => ({
            post_id: post.id,
            image_url: img.url,
            order_index: img.order,
          }))
        );

      if (imagesError) throw imagesError;

      router.push("/");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Failed to upload post. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b-[3px] border-foreground bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-ui font-semibold">Back to Feed</span>
          </Link>
          <h1 className="font-display text-2xl">NEW POST</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full border-[3px] flex items-center justify-center font-display text-lg transition-all ${
                  s <= step
                    ? "bg-accent border-accent text-primary"
                    : "border-foreground opacity-50"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`w-16 h-[3px] ${s < step ? "bg-accent" : "bg-foreground opacity-50"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Images */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-4xl mb-4">UPLOAD IMAGES</h2>
              <p className="font-editorial text-lg opacity-70">Add 1-5 images of your garment</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square border-[3px] border-foreground overflow-hidden group">
                  <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="aspect-square border-[3px] border-dashed border-foreground flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="w-12 h-12 mb-2 opacity-50" />
                  <span className="font-ui text-sm opacity-70">Click to upload</span>
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

            <button
              onClick={() => setStep(2)}
              disabled={images.length === 0}
              className="w-full py-4 bg-accent text-primary font-display text-xl uppercase tracking-wide brutalist-border hover:translate-x-1 hover:translate-y-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              Next Step
              <ArrowRight className="inline-block ml-2 w-6 h-6" />
            </button>
          </div>
        )}

        {/* Step 2: Metadata */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-4xl mb-4">ADD DETAILS</h2>
              <p className="font-editorial text-lg opacity-70">Tell us about this piece</p>
            </div>

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
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 border-[3px] border-foreground font-display text-xl uppercase tracking-wide hover:bg-muted transition-colors"
              >
                <ArrowLeft className="inline-block mr-2 w-6 h-6" />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.brand || !formData.garment_type || !formData.color}
                className="flex-1 py-4 bg-accent text-primary font-display text-xl uppercase tracking-wide brutalist-border hover:translate-x-1 hover:translate-y-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                Preview
                <ArrowRight className="inline-block ml-2 w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-4xl mb-4">PREVIEW</h2>
              <p className="font-editorial text-lg opacity-70">How your post will appear</p>
            </div>

            <div className="border-[3px] border-foreground overflow-hidden">
              <div className="aspect-[4/5] relative bg-muted">
                {previewUrls[0] && (
                  <Image src={previewUrls[0]} alt="Preview" fill className="object-cover" />
                )}
                {previewUrls.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 text-xs font-ui text-secondary">
                    1/{previewUrls.length}
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4 bg-card">
                <div>
                  <h3 className="font-display text-2xl uppercase">{formData.brand}</h3>
                  <p className="font-editorial text-lg opacity-90">{formData.garment_type}</p>
                </div>
                <div className="space-y-2 font-editorial text-sm">
                  <p><span className="font-ui uppercase opacity-70">Color:</span> {formData.color}</p>
                  {formData.size_fit && (
                    <p><span className="font-ui uppercase opacity-70">Size/Fit:</span> {formData.size_fit}</p>
                  )}
                  {formData.brand_social_link && (
                    <p className="truncate">
                      <span className="font-ui uppercase opacity-70">Link:</span>{" "}
                      <span className="text-accent">{formData.brand_social_link}</span>
                    </p>
                  )}
                  {formData.description && (
                    <p className="pt-2 leading-relaxed">{formData.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                disabled={uploading}
                className="flex-1 py-4 border-[3px] border-foreground font-display text-xl uppercase tracking-wide hover:bg-muted transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="inline-block mr-2 w-6 h-6" />
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1 py-4 bg-accent text-primary font-display text-xl uppercase tracking-wide brutalist-border hover:translate-x-1 hover:translate-y-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                {uploading ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
