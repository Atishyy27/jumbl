"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavbarLinks() {
  const pathname = usePathname();

  // Active state calculations
  const isDashboardActive = pathname === "/";
  const isCandidatesActive = pathname === "/" || pathname.startsWith("/applicant/");

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
      <Link
        href="/"
        className={cn(
          "transition-colors",
          isDashboardActive
            ? "text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/"
        className={cn(
          "transition-colors",
          isCandidatesActive
            ? "text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Candidates
      </Link>
    </nav>
  );
}
