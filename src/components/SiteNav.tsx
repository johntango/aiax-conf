// src/components/SiteNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import type { Route } from "next";

type Item = { href: Route; label: string };

// Typed routes; compile-time check that paths exist.
const items = [
  { href: "/", label: "Home" },
  { href: "/committee", label: "Committee" },
  { href: "/callForPapers", label: "Call for Papers" },
  { href: "/venue", label: "Venue" },
  { href: "/program", label: "Program" },
  { href: "/visa", label: "Visa" },
  { href: "/dates", label: "Dates" },
   { href: "/register", label: "Register" },
] as const satisfies readonly Item[];

export default function SiteNav() {
  const pathname = usePathname() || ("/" as Route);
  const [open, setOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<Route | null>(null);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  // Clear "pending" highlight after the route changes.
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
      <div className="container">
        <Link href={"/" as Route} className="navbar-brand" onClick={close}>
          AI &amp; AX Design Conference
        </Link>

        <button
          aria-controls="mainNavbar"
          aria-expanded={open}
          aria-label="Toggle navigation"
          className="navbar-toggler"
          type="button"
          onClick={toggle}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div id="mainNavbar" className={`collapse navbar-collapse${open ? " show" : ""}`}>
          {/* Button group styled nav */}
          <div className="ms-auto my-2 my-lg-0 d-flex flex-wrap gap-2" role="group" aria-label="Primary navigation">
            {items.map(({ href, label }) => {
              const isActive = pathname === href || pendingHref === href;
              const cls = isActive ? "btn btn-primary" : "btn btn-outline-primary";
              return (
                <Link
                  key={href}
                  href={href}
                  className={cls}
                  role="button"
                  aria-current={isActive ? "page" : undefined}
                  aria-pressed={isActive ? true : undefined}
                  onClick={() => {
                    setPendingHref(href);
                    close();
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
