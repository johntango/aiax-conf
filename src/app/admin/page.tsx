// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";

type StripeStatus = {
  secretKeyConfigured: boolean;
  publishableKeyConfigured: boolean;
  webhookSecretConfigured: boolean;
};


function buildAuthHeaders(key: string): HeadersInit | undefined {
  return key ? { Authorization: `Bearer ${key}` } : undefined;
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [stripe, setStripe] = useState<StripeStatus | null>(null);
  const [health, setHealth] = useState<string>("");

  // ✅ Restore key from localStorage (never from process.env on the client)
  useEffect(() => {
    const stored = localStorage.getItem("adminKey");
    if (stored) setKey(stored);
  }, []);

  async function checkAuth() {
    if (!key) { setAuthed(false); return; }
    setChecking(true);
    try {
      const res = await fetch("/api/admin/auth/verify", {
        method: "HEAD",
        headers: buildAuthHeaders(key),
      });
      setAuthed(res.ok);
      if (res.ok) localStorage.setItem("adminKey", key);
    } catch {
      setAuthed(false);
    } finally {
      setChecking(false);
    }
}

  function handleUnlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    checkAuth();
  }

  async function downloadCSV() {
    const res = await fetch("/api/admin/export", { headers: buildAuthHeaders(key) });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      alert(`Export failed: ${res.status} ${res.statusText}${msg ? `\n${msg}` : ""}`);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `export-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  async function downloadSQLite() {
    const res = await fetch("/api/admin/backup/sqlite", { headers: buildAuthHeaders(key) });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      alert(`Backup failed: ${res.status} ${res.statusText}${msg ? `\n${msg}` : ""}`);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `sqlite-${new Date().toISOString().slice(0, 10)}.db`,
    });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
    async function checkStripeStatus() {
        const res = await fetch("/api/admin/stripe/status", {
            headers: buildAuthHeaders(key),
        });
        if (!res.ok) {
            alert("Stripe status check failed (unauthorized or server error).");
            return;
        }
        const data: StripeStatus = await res.json();
        setStripe(data);
    }

    async function pingHealth() {
        const res = await fetch("/api/health");
        if (!res.ok) {
            setHealth("Health check failed.");
            return;
        }
        const data = await res.json();
        setHealth(`OK @ ${data.ts}`);
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">Admin Console</h1>

            {/* Authenticate */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Authenticate</h5>

                    <form onSubmit={handleUnlock} noValidate>
                        {/* Hidden username field to satisfy accessibility/password-manager heuristics */}
                        <label htmlFor="adminUsername" className="form-label visually-hidden">
                            Username
                        </label>
                        <input
                            id="adminUsername"
                            name="username"
                            type="text"
                            autoComplete="username"
                            value="admin"
                            readOnly
                            tabIndex={-1}
                            aria-hidden="true"
                            className="visually-hidden"
                        />

                        <div className="row g-2 align-items-center">
                            <div className="col-sm-8">
                                <label htmlFor="adminKey" className="form-label visually-hidden">
                                    Admin Key
                                </label>
                                <input
                                    id="adminKey"
                                    name="password"
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter Admin Key (ADMIN_EXPORTS_KEY)"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    autoComplete="current-password"
                                    aria-describedby="adminKeyHelp"
                                />
                                <div id="adminKeyHelp" className="form-text">
                                    Organizer-only Admin Key (not a personal account password).
                                </div>
                            </div>

                            <div className="col-sm-4 d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={checking}
                                >
                                    {checking ? "Checking..." : "Unlock"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        localStorage.removeItem("adminKey");
                                        setKey("");
                                        setAuthed(null);
                                        setStripe(null);
                                        setHealth("");
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </form>

                    {authed === true && (
                        <p className="text-success mt-2 mb-0">Authorized.</p>
                    )}
                    {authed === false && (
                        <p className="text-danger mt-2 mb-0">Unauthorized.</p>
                    )}
                </div>
            </div>

            {/* Operations */}
            {authed && (
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title mb-3">Operations</h5>

                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <div className="p-3 border rounded h-100">
                                    <h6>Data Exports</h6>
                                    <p className="text-muted mb-2">
                                        Produce portable backups of registrations.
                                    </p>
                                    <div className="d-flex flex-wrap gap-2">
                                        <button className="btn btn-success" onClick={downloadCSV}>
                                            Download CSV Export
                                        </button>
                                        <button className="btn btn-outline-success" onClick={downloadSQLite}>
                                            Download SQLite Snapshot
                                        </button>
                                    </div>
                                    <small className="text-muted d-block mt-2">
                                        Sends <code>Authorization: Bearer &lt;ADMIN_EXPORTS_KEY&gt;</code>.
                                    </small>
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
                                <div className="p-3 border rounded h-100">
                                    <h6>Stripe</h6>
                                    <p className="text-muted mb-2">
                                        Quick sanity checks for environment configuration.
                                    </p>
                                    <div className="d-flex flex-wrap gap-2">
                                        <button className="btn btn-info" onClick={checkStripeStatus}>
                                            Check Stripe Config
                                        </button>
                                    </div>

                                    {stripe && (
                                        <ul className="mt-3 mb-0">
                                            <li>
                                                <code>STRIPE_SECRET_KEY</code>:{" "}
                                                {stripe.secretKeyConfigured ? (
                                                    <span className="text-success">configured</span>
                                                ) : (
                                                    <span className="text-danger">missing</span>
                                                )}
                                            </li>
                                            <li>
                                                <code>STRIPE_PUBLISHABLE_KEY</code>:{" "}
                                                {stripe.publishableKeyConfigured ? (
                                                    <span className="text-success">configured</span>
                                                ) : (
                                                    <span className="text-danger">missing</span>
                                                )}
                                            </li>
                                            <li>
                                                <code>STRIPE_WEBHOOK_SECRET</code>:{" "}
                                                {stripe.webhookSecretConfigured ? (
                                                    <span className="text-success">configured</span>
                                                ) : (
                                                    <span className="text-danger">missing</span>
                                                )}
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="p-3 border rounded">
                                    <h6>Health</h6>
                                    <div className="d-flex flex-wrap gap-2 align-items-center">
                                        <button className="btn btn-outline-primary" onClick={pingHealth}>
                                            Ping /api/health
                                        </button>
                                        {health && <span className="ms-2">{health}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="my-4" />
                        <p className="text-muted mb-0">
                            The Admin Key is not persisted server-side. It is only used to attach an{" "}
                            <code>Authorization</code> header from this browser.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
