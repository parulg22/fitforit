/**
 * Virtual Try-On modal
 * Supports user photo upload and real AI try-on via Try-on API
 * Category-aware tips and retry-aware loading states
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { X, Upload, Loader2, AlertTriangle, RefreshCw, ShoppingBag } from "lucide-react";
import {
  getUserPhoto,
  setUserPhoto,
  clearUserPhoto,
} from "@/lib/userPhotoStore";
import type { ClothingItem, ClothingCategory } from "@/types";
import { getShopSearchUrl } from "@/lib/shopLinks";

interface TryOnModalProps {
  item: ClothingItem | null;
  open: boolean;
  onClose: () => void;
}

const TRYON_SUPPORTED: ClothingCategory[] = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
];

function getCategoryTip(category: ClothingCategory): string | null {
  switch (category) {
    case "tops":
      return "Works best with front-facing photos in simple clothing.";
    case "bottoms":
      return "Full-body photo recommended. Results vary with skirts vs pants.";
    case "dresses":
      return "Full-body photo required. May take longer and need a retry.";
    case "outerwear":
      return "Works best over simple tops. May need a retry for complex layers.";
    case "shoes":
    case "accessories":
      return null;
    default:
      return null;
  }
}

function getLoadingMessage(category: ClothingCategory): string {
  if (category === "dresses" || category === "outerwear") {
    return "This can take 1–2 minutes for complex items";
  }
  return "This can take 30–90 seconds";
}

export function TryOnModal({ item, open, onClose }: TryOnModalProps) {
  const [userPhoto, setUserPhotoState] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canTryOn =
    item && TRYON_SUPPORTED.includes(item.category);
  const categoryTip = item ? getCategoryTip(item.category) : null;

  useEffect(() => {
    if (!open) return;
    setUserPhotoState(getUserPhoto());
    setAiResult(null);
    setError(null);
    setAttemptCount(0);
  }, [open, item?.id]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUserPhoto(dataUrl);
      setUserPhotoState(dataUrl);
      setAiResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    clearUserPhoto();
    setUserPhotoState(null);
    setAiResult(null);
    setError(null);
  };

  const handleTryOn = async () => {
    if (!userPhoto || !item) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          humanImg: userPhoto,
          garmImg: item.imageUrl,
          garmentDes: item.name,
          category: item.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Try-on failed");
      setAiResult(data.url);
      setAttemptCount(data.attempt || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Try-on failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-200 p-4">
          <h2 className="text-lg font-semibold text-surface-900">
            Try On: {item.name}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!userPhoto ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-surface-50 py-12 transition hover:border-brand-400 hover:bg-brand-50/50"
              >
                <Upload className="h-12 w-12 text-surface-400" />
                <p className="mt-3 font-medium text-surface-700">
                  Upload your photo to try on
                </p>
                <p className="mt-1 text-sm text-surface-500">
                  Full-body, front-facing, good lighting
                </p>
                <p className="mt-2 text-xs text-surface-400">
                  Simple outfit, no accessories (stoles, scarves)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {!canTryOn && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>
                    Virtual try-on works best with tops, bottoms, dresses, and
                    outerwear. {item.category === "shoes" ? "Shoes" : "Accessories"} are
                    not supported yet.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative mx-auto aspect-[3/4] max-w-[280px] overflow-hidden rounded-xl bg-surface-100">
                {aiResult ? (
                  <>
                    <img
                      src={aiResult}
                      alt="Try-on result"
                      className="h-full w-full object-cover object-top"
                      onError={() => setError("Could not load result image")}
                    />
                    <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                      AI result{attemptCount > 1 ? ` (attempt ${attemptCount})` : ""}
                    </span>
                  </>
                ) : (
                  <img
                    src={userPhoto}
                    alt="You"
                    className="h-full w-full object-cover object-top"
                  />
                )}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center gap-3 text-white">
                      <Loader2 className="h-12 w-12 animate-spin" />
                      <p className="text-sm font-medium">
                        Putting it on you...
                      </p>
                      <p className="text-xs opacity-80">
                        {getLoadingMessage(item.category)}
                      </p>
                      {(item.category === "dresses" ||
                        item.category === "outerwear") && (
                        <p className="text-xs opacity-60">
                          Auto-retries if first attempt fails
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {categoryTip && !aiResult && !isLoading && !error && (
                <p className="text-center text-xs text-surface-500">
                  {categoryTip}
                </p>
              )}

              {aiResult && (
                <p className="text-center text-xs text-surface-500">
                  Result not right? Try a different photo or tap &ldquo;Try again&rdquo;.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2">
                {!aiResult && !isLoading && canTryOn && (
                  <button
                    onClick={handleTryOn}
                    className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
                  >
                    Try on with AI
                  </button>
                )}

                {!aiResult && !isLoading && !canTryOn && (
                  <div className="flex items-center gap-2 rounded-xl bg-surface-200 px-6 py-3 font-semibold text-surface-500">
                    Try-on not available for {item.category}
                  </div>
                )}

                {aiResult && (
                  <button
                    onClick={() => {
                      setAiResult(null);
                      setAttemptCount(0);
                      handleTryOn();
                    }}
                    className="flex items-center gap-2 rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                  </button>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-200"
                >
                  <Upload className="h-4 w-4" />
                  Change photo
                </button>
                <button
                  onClick={handleRemovePhoto}
                  className="rounded-lg px-4 py-2 text-sm text-surface-500 hover:text-red-600"
                >
                  Remove photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          <div className="mt-6 space-y-2 text-center">
            <h3 className="font-semibold text-surface-900">{item.name}</h3>
            <p className="text-sm text-surface-600">
              {item.category} &bull; {item.color}
            </p>
            {item.notes && (
              <p className="text-sm text-surface-500">{item.notes}</p>
            )}
            <a
              href={getShopSearchUrl(item)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium text-surface-700 transition hover:bg-surface-200"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Similar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
