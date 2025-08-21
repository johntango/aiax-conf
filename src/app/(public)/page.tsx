"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";



export default function Landing() {
  const pathname = usePathname();
  const title = process.env.NEXT_PUBLIC_SITE_NAME ?? "AI/AX Design Conference";
  const dates = process.env.NEXT_PUBLIC_EVENT_DATES ?? "June 24–25, 2026";
  const subtitle = process.env.NEXT_PUBLIC_EVENT_SUBTITLE ?? "Sponsored by the International Conference on Axiomatic Design";

  return (
    <div className="text-center">
      {/* Splash image */}
      <Image
        src="/RobotICAD.jpg"
        alt="Conference Splash"
        width={1200}
        height={400}
        className="img-fluid rounded mb-4"
      />

      <h1 className="display-4 fw-bold">{title}</h1>
      <p className="lead">{subtitle}</p>
      <p className="text-muted">Dates: <strong>{dates}</strong></p>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <a href="/register-interest" className="btn btn-outline-primary btn-lg">Register Interest</a>
        <a href="/register" className="btn btn-primary btn-lg">Paid Registration ($500)</a>
      </div>
    </div>
  );
}

