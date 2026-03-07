/**
 * Landing page - explains FitForIt value prop
 */

import Link from "next/link";
import { Sparkles, Shirt, Package, Wand2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            <Sparkles className="h-4 w-4" />
            AI-Powered Outfit Planning
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl lg:text-6xl">
            Plan the perfect outfit for every occasion
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-600">
            FitForIt helps you plan outfits for trips and events, try on clothes
            virtually, and generate smart packing lists—so you always look great
            and pack light.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/trips/new"
              className="rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-brand-700 hover:shadow-xl"
            >
              Plan a Trip
            </Link>
            <Link
              href="/closet"
              className="rounded-xl border border-surface-300 bg-white px-8 py-3.5 text-base font-semibold text-surface-700 transition hover:bg-surface-50"
            >
              Build Your Closet
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-surface-200 bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-surface-900 sm:text-3xl">
            Everything you need to dress with confidence
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Shirt}
              title="AI Outfit Planner"
              description="Get smart outfit suggestions based on your event type, destination, and style preferences. We match your closet to the occasion."
            />
            <FeatureCard
              icon={Wand2}
              title="Virtual Try-On"
              description="Preview how outfits look before you pack. Our try-on feature lets you see items on a model—no more guessing."
            />
            <FeatureCard
              icon={Package}
              title="Packing List Generator"
              description="Save outfits to your trip and we'll generate a consolidated packing list. Pack light, look great."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-surface-200 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-surface-900 sm:text-3xl">
            Ready to plan your next outfit?
          </h2>
          <p className="mt-4 text-surface-600">
            Create a trip, add your closet items, and get personalized outfit
            recommendations in seconds.
          </p>
          <Link
            href="/trips/new"
            className="mt-8 inline-block rounded-xl bg-surface-900 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-surface-800"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-surface-50/50 p-8 transition hover:border-surface-300 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-surface-900">{title}</h3>
      <p className="mt-2 text-surface-600">{description}</p>
    </div>
  );
}
