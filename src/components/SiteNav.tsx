"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import type { Route } from "next"; // <-- typed routes

type Item = { href: Route; label: string };

// Keep literals (no widening to string) and check they are valid routes at build time.
const items = [
  { href: "/", label: "Home" },
  { href: "/committee", label: "Committee" },
  { href: "/callForPapers", label: "Call for Papers" },
  { href: "/venue", label: "Venue" },
  { href: "/program", label: "Program" },
  { href: "/visa", label: "Visa" },
  { href: "/dates", label: "Dates" },
] as const satisfies readonly Item[];

export default function SiteNav() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
      <div className="container">
        <Link href={"/" as Route} className="navbar-brand" onClick={close}>
          AI & AX Design Conference
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
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {items.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <li className="nav-item" key={href}>
                  <Link
                    href={href}
                    className={`nav-link${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={close}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
