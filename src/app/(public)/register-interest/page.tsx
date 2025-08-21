"use client";
import { useState } from "react";

export default function RegisterInterestPage() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true); setErr(null);
    const res = await fetch("/api/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        affiliation: formData.get("affiliation"),
        notes: formData.get("notes")
      })
    });
    const j = await res.json();
    if (res.ok) setOk(true); else setErr(j.error ?? "Failed");
    setLoading(false);
  }

  if (ok) return (
    <div className="container">
      <h1 className="h1">Thank you</h1>
      <p>Your interest has been recorded. We will contact you with updates.</p>
      <a href="/"><button>Back to Home</button></a>
    </div>
  );

  return (
    <form action={onSubmit} className="container">
      <h1 className="h1">Register Interest</h1>
      <label htmlFor="name">Full Name</label>
      <input id="name" name="name" placeholder="Ada Lovelace" required />
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" placeholder="ada@example.com" required />
      <label htmlFor="affiliation">Affiliation</label>
      <input id="affiliation" name="affiliation" placeholder="Organization / Institution" />
      <label htmlFor="notes">Notes (optional)</label>
      <textarea id="notes" name="notes" placeholder="Topics of interest" />
      <button disabled={loading}>{loading ? "Submitting…" : "Submit"}</button>
      {err && <p style={{color:'crimson'}}>{err}</p>}
    </form>
  );
}
