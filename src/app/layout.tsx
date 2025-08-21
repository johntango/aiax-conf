import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME ?? "AI and AX Design Conference",
  description: process.env.NEXT_PUBLIC_EVENT_SUBTITLE ?? "International Conference on Axiomatic Design"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <div className="max-w-3xl mx-auto p-6">{children}</div>
      </body>
    </html>
  );
}
