---
name: Security configuration
description: Authentication and cross-origin requests fail closed unless explicitly configured for an approved environment.
---

Admin authentication must require the managed `ADMIN_PASSWORD` secret and session handling must require `SESSION_SECRET`; never restore known development fallbacks. API CORS should allow same-origin requests plus explicitly configured Replit/local development origins, not arbitrary credentialed origins.

**Why:** A known fallback password and permissive credentialed CORS would allow avoidable unauthorized access to the admin CMS and session surface.

**How to apply:** Preserve fail-closed startup/login behavior when secrets are absent, and update the allowlist deliberately when adding a new preview or deployment origin.