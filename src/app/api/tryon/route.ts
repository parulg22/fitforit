/**
 * AI Virtual Try-On API route
 * Uses Try-on API (tryon-api.com) - 10 free credits, no card required
 */

import { NextRequest, NextResponse } from "next/server";

const TRYON_API_BASE = "https://tryon-api.com";
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

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

    // Convert base64 data URL to buffer
    const personMatch = humanImg.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!personMatch) {
      return NextResponse.json(
        { error: "humanImg must be a base64 data URL" },
        { status: 400 }
      );
    }
    const personExt = personMatch[1] === "png" ? "png" : "jpg";
    const personBuffer = Buffer.from(personMatch[2], "base64");

    // Fetch garment image from URL
    const garmentRes = await fetch(garmImg);
    if (!garmentRes.ok) {
      return NextResponse.json(
        { error: "Could not fetch garment image" },
        { status: 400 }
      );
    }
    const garmentBuffer = Buffer.from(await garmentRes.arrayBuffer());

    const formData = new FormData();
    formData.append(
      "person_images",
      new Blob([personBuffer], { type: `image/${personExt}` }),
      `person.${personExt}`
    );
    formData.append(
      "garment_images",
      new Blob([garmentBuffer], { type: "image/jpeg" }),
      "garment.jpg"
    );
    formData.append("fast_mode", "true");
    // Tell API where to apply garment (tops vs bottoms) - may fix wrong body part
    const garmentCategory =
      category === "bottoms"
        ? "lower_body"
        : category === "dresses"
          ? "dresses"
          : "upper_body";
    formData.append("category", garmentCategory);

    const submitRes = await fetch(`${TRYON_API_BASE}/api/v1/tryon`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
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
      return NextResponse.json(
        { error: errMsg },
        { status: submitRes.status === 402 ? 402 : 500 }
      );
    }

    const { jobId, statusUrl } = await submitRes.json();
    if (!statusUrl) {
      return NextResponse.json(
        { error: "Invalid response from Try-on API" },
        { status: 500 }
      );
    }

    // Poll for completion
    let attempts = 0;
    while (attempts < MAX_POLL_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      attempts++;

      const statusRes = await fetch(`${TRYON_API_BASE}${statusUrl}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!statusRes.ok) {
        continue;
      }
      const status = await statusRes.json();

      if (status.status === "completed") {
        // Prefer base64 when available (avoids CDN/domain loading issues)
        const resultUrl =
          (status.imageBase64
            ? `data:image/jpeg;base64,${status.imageBase64}`
            : null) || status.imageUrl;
        if (!resultUrl) {
          return NextResponse.json(
            { error: "Try-on completed but no image returned" },
            { status: 500 }
          );
        }
        return NextResponse.json({ url: resultUrl });
      }

      if (status.status === "failed") {
        throw new Error(
          status.error || status.errorCode || "Try-on generation failed"
        );
      }
    }

    return NextResponse.json(
      { error: "Try-on timed out. Check your dashboard for the result." },
      { status: 504 }
    );
  } catch (error) {
    console.error("Try-on API error:", error);
    const message =
      error instanceof Error ? error.message : "Try-on failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
