/**
 * Main navigation - links to landing, closet, trips, etc.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, Home, MapPin, LayoutGrid } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/closet", label: "Closet", icon: LayoutGrid },
  { href: "/trips", label: "Trips", icon: MapPin },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold text-surface-900 transition hover:text-brand-600"
        >
          <Shirt className="h-6 w-6 text-brand-500" />
          FitForIt
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
