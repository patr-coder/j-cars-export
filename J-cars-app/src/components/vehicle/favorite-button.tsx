"use client";

import { HeartIcon } from "lucide-react";
import Link from "next/link";

import { toggleFavorite } from "@/actions/favorites";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export function FavoriteButton({
  vehicleId,
  isFavorited,
  isSignedIn,
  path,
  className,
}: {
  vehicleId: string;
  isFavorited: boolean;
  isSignedIn: boolean;
  path: string;
  className?: string;
}) {
  if (!isSignedIn) {
    return (
      <Button
        asChild
        variant="outline"
        size="icon"
        className={cn("bg-background/90 backdrop-blur-sm", className)}
      >
        <Link href="/login" aria-label="Sign in to save favorites" onClick={(e) => e.stopPropagation()}>
          <HeartIcon />
        </Link>
      </Button>
    );
  }

  return (
    <form
      action={toggleFavorite.bind(null, vehicleId, path)}
      onClick={(e) => e.stopPropagation()}
      className={cn("relative", className)}
    >
      <Button
        type="submit"
        variant="outline"
        size="icon"
        className="bg-background/90 backdrop-blur-sm"
        aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
      >
        <HeartIcon className={isFavorited ? "fill-destructive text-destructive" : ""} />
      </Button>
    </form>
  );
}
