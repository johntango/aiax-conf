import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100 bg-light">
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand fw-bold" href="/">AI & AX Design</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item"><Link className="nav-link" href="/">Home</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/register-interest">Register Interest</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/register">Paid Registration</Link></li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow-1 container py-4">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-dark mt-auto">
          <Image src="/FooterICAD.jpg" alt="Footer" width={1920} height={200} className="img-fluid" />
        </footer>
      </body>
    </html>
  );
}
