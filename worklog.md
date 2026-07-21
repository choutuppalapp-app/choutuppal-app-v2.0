# Choutuppal App v2.0 — Worklog

Shared work record for all agents. Append new sections with `---` separators.

---
Task ID: 1
Agent: orchestrator (main)
Task: Initialize foundation — Prisma schema, Prisma client singleton, R2 storage, NextAuth auth layer (adapted from Supabase Auth). Push schema to DB.

Work Log:
- Audited existing project: Next.js 16.1.3 (Turbopack), TypeScript, Tailwind 4, shadcn/ui, Prisma v6 on SQLite, next-auth v4 installed. DATABASE_URL already present (`file:/home/z/my-project/db/custom.db`).
- Installed deps: `@aws-sdk/client-s3`, `bcryptjs`, `@next-auth/prisma-adapter`, `@types/bcryptjs`.
- Wrote `prisma/schema.prisma` — full model set adapted to SQLite (Json fields for arrays/objects, String for enum-like values with allowed-values comments). Models: User (+ isPublic, username, role, spinCredits, planTier), Account, Session, VerificationToken, PasswordResetToken, Category, Village, Listing, RealEstate, Story (+ expiresAt), Banner (+ expiresAt), Service, Short, News, Blog, Notification, CommunityPost, CommunityComment, Lead, Setting, SpinPrize. Added indexes on expiresAt (Story/Banner) for the cron job, plus status/ownerId/villageId/categoryId indexes.
- Wrote `src/lib/prisma.ts` (Prisma v6 singleton with HMR-safe globalThis caching, exports `prisma` + `db`). Updated `src/lib/db.ts` to re-export so existing `@/lib/db` imports keep working.
- Wrote `src/lib/r2-storage.ts` — Cloudflare R2 S3 client (`@aws-sdk/client-s3`) with sharp image compression to ~500KB (progressive JPEG quality 80→30, max 1280px edge), object key generation, `uploadToR2`/`deleteFromR2`/`keyFromUrl`, and graceful local-disk fallback to `public/uploads/` when R2 env vars are absent.
- Auth layer (Supabase Auth → NextAuth.js v4 adaptation, since Supabase hosted auth can't run in this sandbox): `src/lib/auth.config.ts` (edge-safe JWT/authorized callbacks), `src/lib/auth.ts` (Credentials provider = email-or-phone + bcrypt password; Google OAuth provider; PrismaAdapter; JWT strategy), `src/types/next-auth.d.ts` (role/username/isPublic type augmentation), `src/app/api/auth/[...nextauth]/route.ts` (App Router handler), `src/lib/auth-password-reset.ts` (custom 1-hour single-use token flow: createPasswordResetToken / verifyPasswordResetToken / resetPassword / hashPassword).
- Route protection: converted to Next.js 16 native `src/proxy.ts` (replaces deprecated `middleware.ts`) using `withAuth`. Guards `/dashboard/*` (any user), `/agent/*` (AGENT/ADMIN), `/admin/*` (ADMIN). Verified the deprecation warning is gone.
- Ran `bun run db:push` — schema synced to SQLite, Prisma Client v6.19.2 generated.
- Added `NEXTAUTH_URL` + generated `NEXTAUTH_SECRET` to `.env`; created `.env.example` documenting all required vars (DATABASE_URL, NEXTAUTH_*, GOOGLE_CLIENT_*, R2_*, CRON_SECRET).
- Restarted dev server; verified: home `/` → 200, `/api/auth/session` → `{}` (200), no NextAuth warnings, no runtime errors. `bun run lint` clean.

Stage Summary:
- Foundation complete and runnable. DB in sync. All 5 requested deliverables done (schema, prisma.ts, r2-storage.ts, auth files) + supporting route handler, types, password-reset helper, env templates, proxy.
- KEY ADAPTATION communicated to user: Supabase/PostgreSQL → SQLite+Prisma; Supabase Auth → NextAuth.js v4 (same user-facing capabilities: email/phone+password, Google OAuth, password reset). These are dictated by this sandbox's stack; the schema + storage + auth code are production-portable.
- Next steps (not yet started): build the actual pages (Home, /dashboard, /business/[slug], /community, /admin, /agent), the 24hr cron cleanup API route (deleteFromR2 then DB row), and seed real data (no dummy data per blueprint).
