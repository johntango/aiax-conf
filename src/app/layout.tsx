import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Image from "next/image";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100 bg-light">
        {/* No navbar here. The (public) layout renders SiteNav once. */}
        <main className="flex-grow-1">
          {children}
        </main>

        <footer className="bg-dark mt-auto">
          <Image
            src="/FooterICAD.jpg"
            alt="Footer"
            width={1920}
            height={200}
            className="img-fluid"
            priority
          />
        </footer>
      </body>
    </html>
  );
}
