"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ListingFormData = {
  brand: string;
  brand_website: string;
  description: string;
  post_type: "live" | "upcoming";
  event_date: string;
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
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="brand" className="text-xs font-medium text-zinc-700">
            Brand Name <span className="text-red-500">*</span>
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
            Description <span className="text-zinc-400">(optional)</span>
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

        <div className="space-y-2 sm:col-span-2">
          <Label className="text-xs font-medium text-zinc-700">
            Type <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-4">
            {(["live", "upcoming"] as const).map((type) => (
              <label
                key={type}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer text-sm font-medium transition-colors ${
                  formData.post_type === type
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <input
                  type="radio"
                  name="post_type"
                  value={type}
                  checked={formData.post_type === type}
                  onChange={() => setFormData({ ...formData, post_type: type })}
                  className="hidden"
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {formData.post_type === "upcoming" && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="event_date" className="text-xs font-medium text-zinc-700">
              Date <span className="text-zinc-400">(optional)</span>
            </Label>
            <Input
              id="event_date"
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="bg-white text-black border border-zinc-300 focus:ring-2 focus:ring-black"
            />
          </div>
        )}
      </div>
    </section>
  );
}
