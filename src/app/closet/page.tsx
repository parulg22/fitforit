/**
 * Digital closet - view and filter clothing items
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Plus, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getClosetItems, addClosetItem } from "@/lib/closetStore";
import type { ClothingCategory, ClothingItem } from "@/types";
import { AddClothingModal } from "@/components/closet/AddClothingModal";
import { TryOnModal } from "@/components/tryon/TryOnModal";

const CATEGORIES: { value: ClothingCategory; label: string }[] = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "dresses", label: "Dresses" },
  { value: "shoes", label: "Shoes" },
  { value: "outerwear", label: "Outerwear" },
  { value: "accessories", label: "Accessories" },
];

export default function ClosetPage() {
  const [categoryFilter, setCategoryFilter] = useState<ClothingCategory | "all">(
    "all"
  );
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tryOnItem, setTryOnItem] = useState<ClothingItem | null>(null);

  useEffect(() => {
    setClosetItems(getClosetItems());
  }, []);

  const filteredItems = useMemo(() => {
    if (categoryFilter === "all") return closetItems;
    return closetItems.filter((i) => i.category === categoryFilter);
  }, [closetItems, categoryFilter]);

  const handleAddItem = (item: Omit<ClothingItem, "id" | "createdAt">) => {
    addClosetItem(item);
    setClosetItems(getClosetItems());
    setShowAddModal(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Your Closet</h1>
          <p className="mt-1 text-surface-600">
            {closetItems.length} items • Add items to get outfit recommendations
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-5 w-5" />
          Add Item
        </button>
      </div>

      {/* Category filter */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-surface-500" />
        <button
          onClick={() => setCategoryFilter("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            categoryFilter === "all"
              ? "bg-brand-600 text-white"
              : "bg-surface-100 text-surface-700 hover:bg-surface-200"
          }`}
        >
          All
        </button>
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setCategoryFilter(value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              categoryFilter === value
                ? "bg-brand-600 text-white"
                : "bg-surface-100 text-surface-700 hover:bg-surface-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Closet grid */}
      <div className="mt-8">
        {filteredItems.length === 0 ? (
          <EmptyClosetState
            category={categoryFilter}
            onAddClick={() => setShowAddModal(true)}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <ClosetItemCard
                key={item.id}
                item={item}
                onTryOn={() => setTryOnItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      <AddClothingModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />
      <TryOnModal
        item={tryOnItem}
        open={!!tryOnItem}
        onClose={() => setTryOnItem(null)}
      />
    </div>
  );
}

function ClosetItemCard({
  item,
  onTryOn,
}: {
  item: ClothingItem;
  onTryOn: () => void;
}) {
  return (
    <Card
      className="group cursor-pointer overflow-hidden p-0 transition hover:shadow-lg"
      onClick={onTryOn}
    >
      <div className="relative block w-full aspect-[4/5] bg-surface-100">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover transition group-hover:opacity-95"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
        />
        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-surface-700">
          {item.color}
        </span>
        <span className="absolute bottom-2 left-2 right-2 rounded-lg bg-brand-600 py-2 text-center text-xs font-semibold text-white shadow-lg">
          Try On
        </span>
      </div>
      <div className="p-4">
        <span className="text-xs font-medium uppercase text-surface-500">
          {item.category}
        </span>
        <h3 className="mt-1 font-semibold text-surface-900">{item.name}</h3>
        {item.notes && (
          <p className="mt-1 line-clamp-2 text-sm text-surface-600">
            {item.notes}
          </p>
        )}
      </div>
    </Card>
  );
}

function EmptyClosetState({
  category,
  onAddClick,
}: {
  category: ClothingCategory | "all";
  onAddClick: () => void;
}) {
  return (
    <Card className="flex flex-col items-center justify-center py-16" hover={false}>
      <div className="rounded-full bg-surface-100 p-6">
        <Filter className="h-12 w-12 text-surface-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-surface-900">
        No items found
      </h3>
      <p className="mt-2 max-w-sm text-center text-surface-600">
        {category === "all"
          ? "Your closet is empty. Add some clothing items to get started."
          : `No ${category} in your closet. Add one or switch to another category.`}
      </p>
      <button
        onClick={onAddClick}
        className="mt-6 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
      >
        Add Item
      </button>
    </Card>
  );
}
