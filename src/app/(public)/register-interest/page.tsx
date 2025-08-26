"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterInterestPage() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setErr(null);

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      affiliation: String(formData.get("affiliation") || ""),
      notes: String(formData.get("notes") || "")
    };

    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      let data: any = {};
      try { if (text) data = JSON.parse(text); } catch { /* ignore parse error */ }

      if (!res.ok) {
        setErr(data?.error || text || "Submission failed");
        setLoading(false);
        return;
      }

      setOk(true);
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <div className="container">
        <h1 className="h1">Thank you</h1>
        <p>Your interest has been recorded.</p>
        <Link href="/"><button>Back to Home</button></Link>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="container">
      <h1 className="h1">Register Interest</h1>
      <label htmlFor="name">Full Name</label>
      <input id="name" name="name" required />
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="affiliation">Affiliation</label>
      <input id="affiliation" name="affiliation" />
      <label htmlFor="notes">Notes</label>
      <textarea id="notes" name="notes" />
      <button disabled={loading}>{loading ? "Submitting…" : "Submit"}</button>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </form>
  );
}
