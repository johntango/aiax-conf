// src/lib/admin-auth.ts
import { createHash, timingSafeEqual } from "crypto";

/** Accept both spellings; prefer ADMIN_EXPORT_KEY. */
const rawKeys = [
    process.env.ADMIN_EXPORT_KEY,
    process.env.ADMIN_EXPORTS_KEY, // legacy fallback
].filter((v): v is string => !!v);

const hashedKeys = rawKeys.map((k) =>
    createHash("sha256").update(k, "utf8").digest()
);

export function isAdminKeyConfigured(): boolean {
    return hashedKeys.length > 0;
}

export function verifyAdminKey(input: string | null | undefined): boolean {
    if (!input || hashedKeys.length === 0) return false;
    const probe = createHash("sha256").update(input, "utf8").digest();
    return hashedKeys.some((h) => h.length === probe.length && timingSafeEqual(h, probe));
}

export function assertAdminAuth(headers: Headers): void {
    if (!isAdminKeyConfigured()) throw new Error("admin_key_not_configured");
    const auth = headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!verifyAdminKey(token)) throw new Error("unauthorized");
}