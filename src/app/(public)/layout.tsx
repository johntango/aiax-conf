import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "AI & AX Design Conference",
  description: "June 24–25, 2025 — International Conference on Axiomatic Design",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        <main className="container py-4">{children}</main>
      </body>
    </html>
  );
}
