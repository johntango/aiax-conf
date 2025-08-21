"use client";
import { useState } from "react";

export default function RegisterPaidPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true); setErr(null);
    const payload = {
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      affiliation: String(formData.get("affiliation") || "")
    };
    const res = await fetch("/api/register/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    if (!res.ok) { setErr(j.error || "Checkout failed"); setLoading(false); return; }
    window.location.href = j.url;
  }

  return (
    <form action={onSubmit} className="container">
      <h1 className="h1">Paid Registration ($500)</h1>
      <p>Complete this form to proceed to secure payment.</p>
      <label htmlFor="name">Full Name</label>
      <input id="name" name="name" placeholder="Grace Hopper" required />
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" placeholder="grace@example.com" required />
      <label htmlFor="affiliation">Affiliation</label>
      <input id="affiliation" name="affiliation" placeholder="Organization / Institution" />
      <button disabled={loading}>{loading ? "Redirecting…" : "Proceed to Payment"}</button>
      {err && <p style={{color:'crimson'}}>{err}</p>}
    </form>
  );
}
