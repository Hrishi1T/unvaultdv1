"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ListingFormData = {
  brand: string;
  garment_type: string;
  color: string;
  size_fit: string;
  brand_social_link: string;
  brand_website: string;
  description: string;
};

export function ListingFormFields({
  formData,
  setFormData,
}: {
  formData: ListingFormData;
  setFormData: (next: ListingFormData) => void;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="text-base font-semibold text-zinc-900">Details</h2>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-xs font-medium text-zinc-700">
            Brand <span className="text-red-500">*</span>
          </Label>
          <Input
            id="brand"
            required
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
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
          <Label htmlFor="color" className="text-xs font-medium text-zinc-700">
            Color <span className="text-red-500">*</span>
          </Label>
          <Input
            id="color"
            required
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="e.g., Black, Vintage Blue, Multi"
            className="bg-white text-black placeholder:text-zinc-500 border border-zinc-300 focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size_fit" className="text-xs font-medium text-zinc-700">
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
              setFormData({ ...formData, brand_social_link: e.target.value })
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
  );
}
