---
name: Security configuration
description: Authentication and cross-origin requests fail closed unless explicitly configured for an approved environment.
---

Admin authentication must require the managed `ADMIN_PASSWORD` secret and session handling must require `SESSION_SECRET`; never restore known development fallbacks. API CORS should allow same-origin requests plus explicitly configured Replit/local development origins, not arbitrary credentialed origins. Localhost preview requests may use changing ports, so allow localhost loopback hostnames without opening external origins.

**Why:** A known fallback password and permissive credentialed CORS would allow avoidable unauthorized access to the admin CMS and session surface.

**How to apply:** Preserve fail-closed startup/login behavior when secrets are absent, and update the allowlist deliberately when adding a new preview or deployment origin.

Credentialed browser requests from Replit use full origins (`https://...`), while `REPLIT_DEV_DOMAIN` and `REPLIT_DOMAINS` may contain hostnames only. Normalize configured domains before comparing CORS origins, and ensure browser API requests use `credentials: "include"`.

**Why:** Comparing a hostname directly to a full Origin header caused the admin login preflight to fail before password authentication, while the UI misleadingly displayed “Invalid password.”

**How to apply:** Keep the explicit origin allowlist, but accept configured Replit hostnames as both HTTP/HTTPS origins and preserve session cookies in the shared web fetch client.