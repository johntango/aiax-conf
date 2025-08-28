import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Principled AI & Design Conference",
  description: "June 24–25, 2026 — International Conference on Axiomatic Design",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className="container py-3">{children}</main>
    </>
  );
}
