/**
 * AI Virtual Try-On API route
 * Uses Try-on API (tryon-api.com) - 10 free credits, no card required
 *
 * Robustness features:
 * - Auto-retry on quality failures (up to 2 attempts)
 * - Disable fast_mode for complex garments (dresses, outerwear)
 * - Category hint sent to API
 */

import { NextRequest, NextResponse } from "next/server";

const TRYON_API_BASE = "https://tryon-api.com";
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 60;
const MAX_RETRIES = 2;

const COMPLEX_CATEGORIES = new Set(["dresses", "outerwear"]);

async function submitAndPoll(
  apiKey: string,
  personBuffer: Buffer,
  personExt: string,
  garmentBuffer: Buffer,
  category: string,
  useFastMode: boolean
): Promise<{ url: string } | { error: string; retryable: boolean }> {
  const formData = new FormData();
  formData.append(
    "person_images",
    new Blob([new Uint8Array(personBuffer)], { type: `image/${personExt}` }),
    `person.${personExt}`
  );
  formData.append(
    "garment_images",
    new Blob([new Uint8Array(garmentBuffer)], { type: "image/jpeg" }),
    "garment.jpg"
  );

  if (useFastMode) {
    formData.append("fast_mode", "true");
  }

  const garmentCategory =
    category === "bottoms"
      ? "lower_body"
      : category === "dresses"
        ? "dresses"
        : "upper_body";
  formData.append("category", garmentCategory);

  const submitRes = await fetch(`${TRYON_API_BASE}/api/v1/tryon`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!submitRes.ok) {
    const errBody = await submitRes.text();
    let errMsg = `Try-on API error: ${submitRes.status}`;
    try {
      const errJson = JSON.parse(errBody);
      errMsg = errJson.error || errJson.detail || errMsg;
    } catch {
      if (errBody) errMsg = errBody.slice(0, 200);
    }
    return { error: errMsg, retryable: submitRes.status >= 500 };
  }

  const { statusUrl } = await submitRes.json();
  if (!statusUrl) {
    return { error: "Invalid response from Try-on API", retryable: false };
  }

  let attempts = 0;
  while (attempts < MAX_POLL_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    attempts++;

    const statusRes = await fetch(`${TRYON_API_BASE}${statusUrl}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!statusRes.ok) continue;

    const status = await statusRes.json();

    if (status.status === "completed") {
      const resultUrl =
        (status.imageBase64
          ? `data:image/jpeg;base64,${status.imageBase64}`
          : null) || status.imageUrl;
      if (!resultUrl) {
        return { error: "Try-on completed but no image returned", retryable: true };
      }
      return { url: resultUrl };
    }

    if (status.status === "failed") {
      const errMsg = status.error || status.errorCode || "Try-on generation failed";
      const isQuality = /unable to generate|quality/i.test(errMsg);
      return { error: errMsg, retryable: isQuality };
    }
  }

  return { error: "Try-on timed out", retryable: false };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.TRYON_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "TRYON_API_KEY is not configured. Add it to .env.local. Get a free key at https://tryon-api.com",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { humanImg, garmImg, category } = body;

    if (!humanImg || !garmImg) {
      return NextResponse.json(
        { error: "humanImg and garmImg are required" },
        { status: 400 }
      );
    }

    const personMatch = humanImg.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!personMatch) {
      return NextResponse.json(
        { error: "humanImg must be a base64 data URL" },
        { status: 400 }
      );
    }
    const personExt = personMatch[1] === "png" ? "png" : "jpg";
    const personBuffer = Buffer.from(personMatch[2], "base64");

    const garmentRes = await fetch(garmImg);
    if (!garmentRes.ok) {
      return NextResponse.json(
        { error: "Could not fetch garment image" },
        { status: 400 }
      );
    }
    const garmentBuffer = Buffer.from(await garmentRes.arrayBuffer());

    const isComplex = COMPLEX_CATEGORIES.has(category || "tops");

    let lastError = "Try-on failed";
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      // First attempt: use fast_mode only for simple garments
      // Retry: always disable fast_mode for higher quality
      const useFastMode = attempt === 0 && !isComplex;

      const result = await submitAndPoll(
        apiKey,
        personBuffer,
        personExt,
        garmentBuffer,
        category || "tops",
        useFastMode
      );

      if ("url" in result) {
        return NextResponse.json({
          url: result.url,
          attempt: attempt + 1,
        });
      }

      lastError = result.error;
      if (!result.retryable) break;

      console.log(
        `Try-on attempt ${attempt + 1} failed (retryable): ${result.error}`
      );
    }

    return NextResponse.json({ error: lastError }, { status: 500 });
  } catch (error) {
    console.error("Try-on API error:", error);
    const message =
      error instanceof Error ? error.message : "Try-on failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
