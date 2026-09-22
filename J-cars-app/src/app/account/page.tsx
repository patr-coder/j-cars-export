import Link from "next/link";

import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { getFavoriteVehicleIds } from "@/lib/favorites/queries";
import { getClientOrders } from "@/lib/orders/queries";
import { getClientQuotes } from "@/lib/quotes/queries";

export default async function AccountSummaryPage() {
  const [profile, user] = await Promise.all([getCurrentProfile(), getCurrentUser()]);

  const [favoriteIds, orders, quotes] = user
    ? await Promise.all([
        getFavoriteVehicleIds(user.id),
        getClientOrders(user.id),
        getClientQuotes(user.id),
      ])
    : [new Set<string>(), [], []];

  const activeOrders = orders.filter((o) => o.status !== "cancelled" && o.status !== "completed");

  const cards = [
    { label: "Favorites", count: favoriteIds.size, href: "/account/favorites" },
    { label: "Active orders", count: activeOrders.length, href: "/account/orders" },
    { label: "Quotes", count: quotes.length, href: "/account/inquiries" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
      </h1>
      <p className="mt-2 text-muted-foreground">Here&apos;s a summary of your account.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border p-4 transition-colors hover:bg-muted"
          >
            <p className="text-2xl font-semibold">{card.count}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
