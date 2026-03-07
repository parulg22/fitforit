/**
 * Modal to add a new clothing item to the closet
 */

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ClothingCategory, ClothingItem } from "@/types";

const CATEGORIES: { value: ClothingCategory; label: string }[] = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "dresses", label: "Dresses" },
  { value: "shoes", label: "Shoes" },
  { value: "outerwear", label: "Outerwear" },
  { value: "accessories", label: "Accessories" },
];

interface AddClothingModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: Omit<ClothingItem, "id" | "createdAt">) => void;
}

export function AddClothingModal({
  open,
  onClose,
  onAdd,
}: AddClothingModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClothingCategory>("tops");
  const [color, setColor] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1564382225035-dbdf309682a6?w=400&h=500&fit=crop"
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, category, color, imageUrl, notes });
    setName("");
    setCategory("tops");
    setColor("");
    setImageUrl("https://images.unsplash.com/photo-1564382225035-dbdf309682a6?w=400&h=500&fit=crop");
    setNotes("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-surface-900">
            Add Clothing Item
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. White Linen Shirt"
              className="mt-1 w-full rounded-lg border border-surface-300 px-4 py-2 text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ClothingCategory)}
              className="mt-1 w-full rounded-lg border border-surface-300 px-4 py-2 text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700">
              Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. White, Navy, Black"
              className="mt-1 w-full rounded-lg border border-surface-300 px-4 py-2 text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-surface-300 px-4 py-2 text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Great for layering"
              rows={2}
              className="mt-1 w-full rounded-lg border border-surface-300 px-4 py-2 text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700"
            >
              Add to Closet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-300 px-6 py-3 font-semibold text-surface-700 transition hover:bg-surface-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
