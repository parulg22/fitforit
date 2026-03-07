/**
 * Closet store - combines mock data with user-added items
 * In production, replace with API/DB
 */

import type { ClothingItem } from "@/types";
import { MOCK_CLOSET_ITEMS } from "@/data/mockCloset";

const STORAGE_KEY = "fitforit-closet";

function getStoredItems(): ClothingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredItems(items: ClothingItem[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/** Get all closet items (mock + user-added) */
export function getClosetItems(): ClothingItem[] {
  const stored = getStoredItems();
  const mockIds = new Set(MOCK_CLOSET_ITEMS.map((i) => i.id));
  const userItems = stored.filter((i) => !mockIds.has(i.id));
  return [...MOCK_CLOSET_ITEMS, ...userItems];
}

/** Add item to closet */
export function addClosetItem(
  item: Omit<ClothingItem, "id" | "createdAt">
): ClothingItem {
  const newItem: ClothingItem = {
    ...item,
    id: `item-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const stored = getStoredItems();
  const mockIds = new Set(MOCK_CLOSET_ITEMS.map((i) => i.id));
  const userItems = stored.filter((i) => !mockIds.has(i.id));
  userItems.push(newItem);
  setStoredItems(userItems);
  return newItem;
}
