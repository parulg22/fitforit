# FitForIt

**AI outfit planner for trips and events** — plan outfits, try on clothes virtually, and generate smart packing lists.

## Features

- **Landing page** — Clear value prop: AI outfit planner, virtual try-on, packing list generator
- **Trip/event creation** — Name, destination, dates, event type, style vibe, weather placeholder
- **Digital closet** — Upload clothing items (image, category, color, notes), grid view, filter by category
- **Rule-based outfit engine** — Suggestions grouped by occasion (travel day, brunch, dinner, event, etc.)
- **Trip dashboard** — Itinerary-style outfit suggestions, save outfits, auto-generated packing list
- **AI virtual try-on** — Upload your photo, try on with Replicate IDM-VTON (optional, requires API key)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### AI Virtual Try-On (Optional)

To enable real AI try-on (garment composited onto your photo):

1. Get an API token at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Create `.env.local` in the project root:
   ```
   REPLICATE_API_TOKEN=r8_your_token_here
   ```
3. Upload your photo in the Try On modal, then click **"Try on with AI"**

Uses [IDM-VTON](https://replicate.com/cuuupid/idm-vton) (~$0.024/run, ~15–20 sec). Non-commercial use only (CC BY-NC-SA).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── closet/              # Digital closet
│   └── trips/               # Trip list, create, detail
├── components/
│   ├── Nav.tsx             # Main navigation
│   ├── closet/              # Add clothing modal
│   ├── trip/                # Trip dashboard, outfit cards
│   ├── tryon/               # Virtual try-on modal
│   └── ui/                  # Reusable Card, etc.
├── data/                    # Mock closet & trips
├── lib/
│   ├── outfitEngine.ts     # Rule-based recommendation logic
│   ├── packingList.ts      # Packing list generator
│   ├── closetStore.ts      # Closet state (mock + sessionStorage)
│   ├── tripStore.ts        # Trip state
│   └── savedOutfitsStore.ts # Saved outfits per trip
└── types/                   # TypeScript types
```

## Demo Flow

1. **Landing** → Read about FitForIt, click "Plan a Trip" or "Build Your Closet"
2. **Create trip** → Fill in name, destination, dates, event type, vibe
3. **Closet** → Browse mock items, add new ones, filter by category, click items to "Try On"
4. **Trip dashboard** → See outfit suggestions by occasion, save outfits, view packing list
5. **Try On** → Click any clothing item to open the placeholder try-on modal

---

## Extending FitForIt

### 1. Real Virtual Try-On Models

The try-on flow is structured for easy replacement:

- **Location**: `src/components/tryon/TryOnModal.tsx`
- **Current**: Mock silhouette + item image overlay
- **Future**: Integrate models like:
  - [IDM-VTON](https://github.com/yisol/IDM-VTON) — high-quality virtual try-on
  - [OOTDiff](https://github.com/levihsu/OOTDiff) — diffusion-based try-on
  - [VITON-HD](https://github.com/shadow2496/VITON-HD) — high-res try-on

**Implementation outline**:

1. Add an API route (e.g. `/api/tryon`) that accepts:
   - `personImage` (user photo or model)
   - `garmentImage` (clothing item)
2. Call your chosen model (Python service, Replicate, etc.)
3. Return the composited image and display it in `TryOnModal`

```ts
// Example: src/app/api/tryon/route.ts
export async function POST(req: Request) {
  const { personImage, garmentImage } = await req.json();
  const result = await callTryOnModel(personImage, garmentImage);
  return Response.json({ resultImage: result });
}
```

### 2. Weather API Integration

- **Location**: `src/app/trips/new/page.tsx`, `src/lib/outfitEngine.ts`
- **Current**: Manual "weather placeholder" text field
- **Future**: Use [OpenWeatherMap](https://openweathermap.org/api), [WeatherAPI](https://www.weatherapi.com/), or similar

**Implementation outline**:

1. Add `destination` → lat/lng (geocoding) or use city name
2. Fetch forecast for trip dates
3. Pass `temperature`, `conditions` into `outfitEngine`
4. Adjust scoring: e.g. prefer outerwear when cold, light fabrics when hot

### 3. Shopping Recommendations

- **Location**: New `src/components/shopping/` or extend outfit cards
- **Future**: After showing an outfit, suggest "Shop similar" items
- **APIs**: Affiliate feeds (Amazon, Shopify), or style APIs (e.g. visual search)

**Implementation outline**:

1. For each recommended outfit item, call a product search API
2. Display "Find similar" links or product cards below the outfit

### 4. Smarter Personalized Outfit Ranking

- **Location**: `src/lib/outfitEngine.ts`
- **Current**: Rule-based scoring (vibe colors, occasion, notes)
- **Future**: ML-based ranking

**Implementation outline**:

1. Collect implicit feedback (saved outfits, time spent, etc.)
2. Train a lightweight model (e.g. XGBoost, simple neural net) to predict "user would save this"
3. Or use an LLM to generate reasoning and rank outfits by semantic fit
4. Replace `scoreItemForOccasion` with model inference

---

## License

MIT
