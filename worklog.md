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

---
Task ID: 2 + 3
Agent: orchestrator (main)
Task: Build the 24hr cron cleanup API + the Home page UI (13 sections) per the PRD. Seed real data. Verify with Agent Browser.

Work Log:
- Task 2 — Cron cleanup API (`src/app/api/cron/cleanup/route.ts`): finds Stories & Banners where expiresAt < NOW(); for each, calls deleteFromR2(key) to delete the Cloudflare R2 file FIRST, then prisma delete the DB row. On file-delete failure, keeps the row for retry next run (never orphans blobs). Auth via `Authorization: Bearer <CRON_SECRET>` header (also accepts ?secret= query). Returns 401 unauthorized / 200 with JSON stats {ok, deletedStories, deletedBanners, fileDeleteFailures, errors}. GET + POST exported. Added CRON_SECRET to .env. Verified: 401 without header, 200 with header (expiredStories:0 since seed sets future expiry).
- Task 3-a — Design system: appended brand utilities to globals.css (blue→gold gradient text/bg/ring, .glass/.glass-strong glassmorphism, .hover-glow/.hover-lift, .no-scrollbar, .fancy-scroll custom scrollbar, @keyframes marquee/shimmer/spin-slow, .font-telugu). Updated layout.tsx: Choutuppal metadata (title/desc/OG/Twitter/manifest), Noto Sans Telugu font (for Telugu testimonials), themeColor, force light theme. Created public/manifest.webmanifest + public/icon.svg (PWA installable).
- Task 3-b — Seed script (`prisma/seed.ts`, idempotent via upsert by slug): 5 villages (Choutuppal, Yadadri, Bhongir, Aler, Motakonduru), 8 categories (Restaurants, Medical, Electronics, Groceries, Education, Automobile, Fashion, Health), 1 demo ADMIN user, 8 listings (Sri Lakshmi Tiffin Center, Choutuppal Medical Hall, Sri Venkateswara Mobiles, Anand Super Bazaar, Sri Sai Vidya Niketan, Reddy Automobiles, Lakshmi Ganapathi Textiles, Sri Venkateswara Clinic), 4 real estate (3BHK sale ₹45L, plot ₹18L, 2BHK rent ₹12k, commercial shop rent ₹25k), 6 stories (future expiresAt), 3 banners, 4 shorts (YouTube), 5 spin prizes, settings. Ran successfully. Verified DB counts.
- Task 3-c — Server data fetchers (`src/lib/home-data.ts`): getActiveStories/getActiveBanners (expiresAt > now), getCategories, getFeaturedListings (APPROVED + isFeatured), getPremiumRealEstate, getShorts, getVillages, getHomePageData (Promise.all). Plain serializable objects.
- Task 3-d — Home section components (13): site-header (sticky, search + village/category Select filters, Install App, Login, mobile drawer), ticker (marquee + pause/play toggle), stories-rail (premium, WhatsApp-style gradient-ring avatars, Add story), banner-carousel (16:9 glossy shimmer gradient, ₹99/day badge, arrows + dots, Promote CTA), categories-grid (5 glassmorphism cards w/ hover glow: Business/Services/Real Estate/News/Blogs), featured-rail (DB-driven shop cards, ratings, hover lift), real-estate-rail (price, BHK, sqft, sale/rent badges), spin-win (animated SVG wheel, free spin button, gradient ring hub), shorts-rail (YouTube thumbnails, play overlay), testimonials (exact 4 Telugu quotes, .font-telugu, gradient avatars, 5-star), pricing-plans (4 plans: Basic Free / Pro ₹299→Free / Premium ₹499→Free / Banner ₹99→Free, "Most Popular" badge on Premium), site-footer (MSOIN MD, Choutuppal, Yadadri, Telangana, 508252, 9912353705, News/Blog/Community links, social), bottom-nav (mobile fixed, 5 tabs: Home/Shorts/Explore/Add FAB/You). Plus section-heading shared component.
- Task 3-e — Assembled src/app/page.tsx: force-dynamic server component, getHomePageData(), flex min-h-screen flex-col wrapper with all 13 sections + mt-auto footer + bottom nav + mobile spacer.
- KEY FIX — r2-storage.ts lazy-load refactor: the 4GB sandbox OOM-killed the dev server when both / and the cron route (which imports @aws-sdk/client-s3 + sharp) were loaded in memory. Refactored r2-storage.ts to lazy-load aws-sdk and sharp via dynamic import() inside getR2Client/compressImage/uploadToR2/deleteFromR2. Now importing r2-storage is cheap; heavy modules only load on actual upload/delete. This lets the cron route (0 expired items → no deletion) coexist with / in one server session. Verified: / (200, 369KB) + cron 401 + cron 200 + / cached all survive in one process.
- Dev server note: `bun run dev` pipes through `tee` which broke on shell exit (process died between commands). Switched to running `next dev` directly via setsid+disown for stability. The server is stable for normal preview use; it only OOMs under concurrent Chromium automation (agent-browser) + heavy compile load. Routes are cached in .next so runtime is fast.

Agent Browser verification (Task 4):
- Page renders: title "Choutuppal App v2.0 — Business, Real Estate & Community". 8 h2 headings (Stories, Browse Categories, Featured Business & Services, Premium Real Estate, Spin & Win, Shorts & Reels, What People Say, Early Bird Offer — All FREE). All 13 sections present.
- Telugu testimonials render exactly: "ఈ యాప్ ద్వారా నా బిజినెస్ కు కొత్త కస్టమర్లు వస్తున్నారు. సూపర్ యాప్!" ✓
- Footer: "MSOIN MD ... Choutuppal, Yadadri, Telangana ... 9912353705" ✓. Header position: sticky ✓. Bottom nav present ✓.
- Interactions: ticker "Pause ticker" → click → "Play ticker" → click → "Pause ticker" (toggle works ✓). Spin button click ✓. Banner carousel arrows + pagination dots ✓. Search box + village/category filters ✓.
- DB data flowing: Featured listings show real seeded data (Sri Venkateswara Clinic 4.0, Reddy Automobiles 4.7, Anand Super Bazaar 4.4, Sri Venkateswara Mobiles 4.1). Stories show choutuppal_demo owner.
- Sticky footer: wrapper className "flex min-h-screen flex-col", minHeight 577px (100vh), footer has mt-auto, footerAtBottom: true, docHeight 3900px (long content pushes footer down naturally) ✓.
- Mobile responsive: viewport 390x844, bottom nav visible ✓, screenshots captured (.verify/home-desktop.png, .verify/home-mobile.png).
- Zero page errors; console clean (only React DevTools info + HMR logs).
- Cron endpoint: 401 unauthorized ✓, 200 authorized with {ok:true, expiredStories:0, deletedBanners:0} ✓.

Stage Summary:
- Both deliverables complete and browser-verified. `bun run lint` clean. Committed locally (9e96171). .env untracked (secrets protected).
- "Push to GitHub": the sandbox has NO git remote configured, so I committed locally only. User must add their GitHub remote (`git remote add origin <url>`) and `git push` from their environment.
- Known environment constraint: 4GB RAM / no swap → dev server can OOM if Chromium automation runs concurrently with a fresh route compile. Mitigated by lazy-loading heavy modules + caching .next. Normal single-user preview is stable.
- Next steps (per master blueprint): /login page, /dashboard, /business/[slug] mini-website, /community, /admin, /agent panels; the upload flow wiring R2; YouTube sync; CSV bulk upload.

---
Task ID: 4-d
Agent: frontend-styling-expert
Task: Build the Choutuppal App v2.0 Login page (src/app/login/page.tsx) — mobile-first, glassmorphism, blue→gold gradient, with Login + Sign Up tabs and Forgot Password dialog.

Work Log:
- Read prior worklog (Tasks 1, 2+3): foundation (Prisma + NextAuth v4 + R2 + proxy), home page (13 sections) + design system in globals.css. Confirmed existing utility classes (`gradient-text`, `gradient-brand`, `gradient-brand-soft`, `glass`, `glass-strong`, `hover-glow`, `hover-lift`), shadcn/ui primitives (Button, Input, Label, Tabs, Dialog, Card), and the API contracts for `/api/auth/{signup,forgot-password,reset-password}` + NextAuth credentials `signIn`.
- Created `src/app/login/page.tsx` — single self-contained client component (`'use client'`).
  - Layout: full-viewport `<main>` with body's existing blue→gold radial gradient background + two extra blurred orbs (blue top-left, amber bottom-right). Centered `max-w-[440px]` glass-strong card with `rounded-3xl p-6 sm:p-8`. Logo (rounded-2xl `gradient-brand` square with "C" + "Choutuppal / App v2.0" wordmark) sits above the card; "← Back to Choutuppal Home" link (`/`) below.
  - Tabs: controlled `Tabs` with two triggers (Login | Sign Up), `data-[state=active]:bg-white text-blue-700` styling on the active trigger to match the brand accent without using `indigo`/`blue-600` fill (per the "no blue-600/700 primary fill except via `gradient-brand`" rule — only `gradient-brand` is used for primary button fills; `text-blue-600` is used sparingly for the "Forgot password?" link and the logo subtitle, exactly as the rule allows).
  - Login tab: Email-or-Phone + Password inputs (with show/hide eye toggle), "Forgot password?" link that opens the dialog, primary `gradient-brand` "Login" button → `signIn('credentials', { identifier, password, redirect: false })`, on `res.ok && !res.error` calls `router.push('/dashboard')`; on failure shows red error box ("Invalid email/phone or password"). Secondary outline "Continue with Google" button with inline 4-color Google "G" SVG → `signIn('google', { callbackUrl: '/dashboard' })`. Both buttons show `<Loader2 className="animate-spin" />` while pending and are disabled while pending. Demo info box with `gradient-brand-soft` bg + `Sparkles` icon: "Demo login: demo@choutuppal.app / demo1234" in monospace code chips.
  - Sign Up tab: Full Name, Username (optional), Email or Phone, Password (min 6), Confirm Password. Client-side validation (name present, identifier present, password >= 6, passwords match) before submit. On submit → `POST /api/auth/signup` with `{ name, identifier, password, username? }`. On non-ok response, shows server's `{ error }`. On 201, immediately calls `signIn('credentials', …)` for auto-login, then `router.push('/dashboard')`. If auto-login fails (e.g. race), falls back to switching to the Login tab with the identifier pre-filled + a toast. "Continue with Google" button present here too.
  - Forgot Password dialog (Radix Dialog from `@/components/ui/dialog`, glass-strong content): 2-step flow. Step 1: identifier input → `POST /api/auth/forgot-password` with `{ identifier }` → on 200 shows "If the account exists, a reset link has been sent." If `devToken` is present in the response (dev mode), displays it in an amber code box ("Dev mode reset token: <token>") AND auto-fills the token field in step 2 for convenience. Step 2: token + new-password inputs → `POST /api/auth/reset-password` with `{ token, password }` → on 200 shows `toast.success('Password reset! You can now log in.')`, closes dialog, resets state, switches to Login tab. Back button on step 2 lets user correct the identifier. Errors from either API surface in a red error box.
  - All async actions wired to sonner toasts (`toast.success` / `toast.error`) for the success/redirect cases (per spec).
  - Accessibility: `role="alert"` on all error boxes, `aria-label` on password-eye toggle buttons, labels properly associated via `htmlFor`/`id`, `autoComplete` hints (`username`, `current-password`, `new-password`, `name`, `email`) on every input, dialog title + description present.
- Layout tweak: `src/app/layout.tsx` was missing the Sonner `<Toaster />` mount (only the radix `Toaster` from `@/components/ui/toaster` was present, which is a separate system). Since the spec mandates sonner for toasts and the existing `src/components/ui/sonner.tsx` component was already installed, imported it as `Toaster as SonnerToaster` and added `<SonnerToaster position="top-center" richColors closeButton />` alongside the existing radix Toaster. Both coexist; the radix Toaster is left in place so any existing `useToast()` calls elsewhere keep working. No `ThemeProvider` is required — `next-themes`'s `useTheme()` safely defaults to `"system"` without a provider, which is fine for this strictly-light-theme app.
- Verification: `bun run lint` → clean (zero warnings/errors). `bunx tsc --noEmit` shows ZERO errors in `src/app/login/page.tsx` and `src/app/layout.tsx` (pre-existing errors in unrelated files like `src/proxy.ts`, `src/lib/auth.config.ts`, `examples/`, `skills/` were already there before this task and are out of scope). Curl-probed the running dev server (managed by another agent): `GET /login` → 200, HTML contains the Choutuppal title, the `gradient-brand` logo square, the `gradient-brand` Login button, and the `gradient-brand-soft` demo info box — confirming SSR render is clean.

Decisions / notes:
- Used `Loader2` from `lucide-react` (already a project dep) with `animate-spin` for all loading spinners — matches the existing home-page icon vocabulary.
- Used `text-blue-600` sparingly (logo subtitle + "Forgot password?" link) per the spec's allowance; all primary fills come from `gradient-brand`. No `indigo`, no `blue-600/700` button backgrounds.
- Sonner Toaster added to root layout (small additive change) because the spec says "There's a Toaster in the root layout already" — but in reality only the radix Toaster was there. Sonner needs its own mount; without it `toast.success(...)` calls would silently no-op.
- `signIn('google', …)` will redirect the browser to Google OAuth; if env vars aren't configured it surfaces NextAuth's default error page — the spec explicitly accepts this for the demo. The button stays present and enabled in both tabs.
- After successful signup, the page attempts auto-login and only falls back to the Login tab if auto-login fails — this gives the smoothest UX for the common path while still handling the edge case.

Stage Summary:
- Deliverable complete: `src/app/login/page.tsx` (single self-contained client component, ~580 lines) + a one-line additive change to `src/app/layout.tsx` to mount the Sonner Toaster.
- All three modes work end-to-end against the already-implemented API routes: Login (credentials + Google), Sign Up (with auto-login), Forgot Password (2-step with dev token display). Lint clean, types clean for the touched files, SSR verified 200 on the running dev server.
- Next steps (other agents): the /dashboard route is the redirect target — once it's live, the full login→dashboard flow can be browser-verified end-to-end. Google OAuth needs `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` env vars for the "Continue with Google" button to actually complete (button is otherwise present-but-erroring, per spec).

---
Task ID: 4 (auth + dashboard + add-listing)
Agent: orchestrator (main) + frontend-styling-expert subagent (login page)
Task: Build Login page (/login), User Dashboard (/dashboard), and Add Listing modal with full backend CRUD APIs.

Work Log:
- Task 4-a: Session helpers (src/lib/session.ts): getSession, getCurrentUser, requireUser (Server Component redirect), requireApiUser (API route 401/403). Auth APIs: POST /api/auth/signup (email/phone + bcrypt), POST /api/auth/forgot-password (1hr token, returns devToken in dev), POST /api/auth/reset-password (consume token + set password).
- Task 4-b: Upload API (POST /api/upload): multipart/form-data, max 5 files, 25MB raw limit, compresses images to ~500KB via sharp + R2 (local fallback). Session-guarded.
- Task 4-c: CRUD APIs (all session-guarded): GET/POST /api/listings + PATCH/DELETE /api/listings/[id] (auto-slug, status PENDING, media cleanup on delete). GET/POST /api/real-estate + PATCH/DELETE /api/real-estate/[id]. GET/POST /api/banners (24hr expiresAt). GET/POST /api/stories (24hr expiresAt). GET/PATCH /api/profile (username/phone uniqueness, old media cleanup).
- Task 4-d [SUBAGENT]: Login page (src/app/login/page.tsx) — Login + Sign Up tabs, Google OAuth button, Forgot Password 2-step dialog (token → new password). Mobile-first gradient/glass UI, demo credentials hint, sonner toasts. Subagent also added Sonner Toaster to layout.tsx.
- Task 4-e: Dashboard shell (src/components/dashboard/dashboard-shell.tsx) — responsive sidebar (desktop) + mobile drawer + bottom nav with center FAB. Tab state: Overview, Profile, Listings, Real Estate, Media, Analytics. UserCard with role/plan badges + quick stats.
- Task 4-f: Dashboard sections: ProfileSection (cover+photo R2 upload via ImageUpload, editable name/username/bio/phone, public/private Switch, upgrade CTAs). MyListings (cards with status badges, edit/delete, empty state). MyRealEstate (property cards with price/BHK/sqft, delete). MyBannersStories (live 24hr countdown timer hh:mm:ss via useCountdown hook, auto-expire pill). Analytics (8 stat cards + 7-day views bar chart). Shared image-upload.tsx (ImageUpload + GalleryUpload components).
- Task 4-g: AddListingModal — Tabs: Business/Service/Real Estate. Logo (1:1) + Cover (16:9) + Gallery (max 5) uploads. Dynamic: RE → Price/BHK/Size/Sale-Rent/Negotiable; Business/Service → Services Catalog (+ Add Service rows). Shared: Name, Phone, WhatsApp, Village dropdown, Address, Map link, Rating, About. Submits to /api/listings or /api/real-estate.
- Schema: added User.coverImage field (db:push). Seed: demo user now has passwordHash ('demo1234') so login is testable.
- CRITICAL FIX — proxy.ts: Next.js 16 proxy convention requires function named `proxy` (not `middleware`). next-auth v4's withAuth has a JWT-decode incompatibility in the Next 16 edge runtime (authorized callback receives undefined request, can't read session JWT). Converted proxy to a thin pass-through; Server Components (getCurrentUser → redirect /login) are the source of truth for auth — the recommended Next.js 16 pattern.
- CRITICAL FIX — auth.config.ts: authorized callback now guards against undefined `request` (Next 16 edge quirk).
- ENV FIX: .env lost NEXTAUTH_SECRET/URL during the session (file was reset to just DATABASE_URL). Restored via Write tool (persists reliably). Added CRON_SECRET.

Verification (via curl — Agent Browser's Chromium OOM-kills the 4GB sandbox):
- /login → 200 (renders) ✓
- /dashboard without auth → 307 redirect to /login ✓ (server component guard)
- Login (demo@choutuppal.app / demo1234) → 200, session cookie set, session shows {name:"Choutuppal Demo", role:"ADMIN"} ✓
- /dashboard with session → 200, 70KB HTML, all sections present: "Welcome back", "My Listings", "Banners", "Analytics", "Add Listing", "Choutuppal Demo", "Overview" ✓
- POST /api/listings → 201 with auto-slug "test-business-via-api", status PENDING ✓
- bun run lint → 0 errors, 0 warnings ✓

Stage Summary:
- All 3 tasks complete and verified. Committed (4cbe44c + this commit). .env untracked (secrets protected).
- Demo login: demo@choutuppal.app / demo1234 (ADMIN role, owns 8 listings, 4 properties, 3 banners, 6 stories).
- The full user flow works: Home → Login → Dashboard → Profile edit / Add Listing / View banners+stories countdown / Analytics.
- Known limitation: Agent Browser (Chromium) cannot run alongside the dev server on this 4GB box — OOM-kills the process. All verification done via curl with cookie handling, which proves the same HTTP-level behavior.
- "Push to GitHub": no git remote configured in this sandbox. Committed locally; user must add remote and push.

---
Task ID: 5 + 6
Agent: orchestrator (main)
Task: Build the Listing Detail / Mini-Website (/business/[slug]) and the Admin Panel (/admin) per the PRD.

Work Log:
- Task 5-a: Added admin helpers to src/lib/session.ts (isAdminRole, requireApiAdmin, requireAdmin). Created src/app/business/[slug]/page.tsx — server component with generateMetadata (absolute OG url, OG title/description, OG image from cover/logo, Twitter card). Access control: non-APPROVED listings 404 unless viewer is owner/admin. Auto-increments views for approved listings (non-owner).
- Task 5-b: Created src/components/business/listing-detail-view.tsx — 16:9 cover banner with overlapping 1:1 logo, title + category badge + featured badge, 4 info tiles (rating/views/hours/area), About section (renders description safely), Services Catalog grid (WhatsApp Business style cards with price pills), Gallery horizontal scroll, Address + Business Hours (mon-sun), owner contact card. Sticky MOBILE action bar (fixed bottom, 5 buttons): Call (tel:), WhatsApp (wa.me), Save Contact (.vcf via Blob download), Location (Google Maps link), Share (Web Share API with clipboard fallback). Desktop STICKY RIGHT SIDEBAR with the same 5 action buttons (vertical).
- Task 6-a: Created admin API routes (all session-guarded via requireApiAdmin):
  - GET /api/admin/stats — dashboard stats (totalUsers, totalListings, pendingApprovals, activeBanners, activeStories, totalProperties, bannedUsers)
  - GET /api/admin/pending — PENDING listings + real estate with owner/category/village
  - PATCH /api/admin/approve/[id]?type=listing|realestate — sets APPROVED + creates notification for owner
  - DELETE /api/admin/reject/[id]?type=listing|realestate — deletes R2 media first, then DB row, + notification
  - GET /api/admin/users — all users with _count (listings, realEstates)
  - PATCH /api/admin/users/[id] — actions: ban, unban, promote_agent, promote_admin, demote_user, reset_password (bcrypt). Guards against self-ban/demote.
  - GET/PATCH /api/admin/settings — key-value upsert (spin_enabled, pricing_free, announcement_ticker, banner_price)
- Task 6-b: Created src/app/admin/page.tsx (server component, requireAdmin → redirect /login or /) + src/components/admin/admin-panel.tsx (client component, 4 tabs):
  - Overview: 6 stat cards + welcome card
  - Approvals: lists PENDING listings + real estate with Approve/Reject buttons (loading states, refresh)
  - Users: searchable table with role Select dropdown (USER/AGENT/ADMIN), ban/unban icon buttons, reset-password modal
  - Settings: Spin & Win toggle, Pricing Free toggle, Announcement Ticker textarea, Banner Ad price input, Save button

Verification (via curl — 4GB sandbox OOMs under Chromium + concurrent compiles):
- /business/sri-lakshmi-tiffin-center → 200, 53KB. SEO title "Sri Lakshmi Tiffin Center · Restaurants & Tiffin | Choutuppal App". OG url absolute "http://localhost:3000/business/sri-lakshmi-tiffin-center" (WhatsApp preview requirement). Content: Sri Lakshmi, Services Catalog, About, WhatsApp, Save, Call, Get in Touch all present ✓
- /business/nonexistent-xyz → 404 ✓
- Login (demo@choutuppal.app / demo1234) → 200, session-token cookie set, session shows role ADMIN ✓
- /api/admin/stats → 200 {totalUsers:1, totalListings:8, activeBanners:3, activeStories:6, totalProperties:4} ✓
- /admin with admin session → 200, 37KB, all 4 tabs present (Overview, Approvals, Users, Settings) ✓
- Create PENDING listing via POST /api/listings → /api/admin/pending shows it → PATCH /api/admin/approve/[id] → 200 status APPROVED → removed from pending list ✓
- bun run lint → clean (0 errors, 0 warnings)

ENV ISSUE: .env repeatedly lost NEXTAUTH_SECRET during this session (reset to just DATABASE_URL multiple times — root cause of earlier 401s). Restored with a stable persistent secret value. Committed both tasks (2 commits: feat + upload-route fix). .env untracked.

Stage Summary:
- Both deliverables complete and verified. The full platform now has: Home, Login/Signup, Dashboard (profile/listings/RE/banners-stories/analytics + add-listing modal), Business mini-website (SEO + WhatsApp actions), and Admin Panel (stats/approvals/users/settings).
- Known limitation: Agent Browser (Chromium) cannot run alongside the dev server on this 4GB box — OOM-kills the process during fresh route compiles. All verification done via curl with cookie handling.
- Next steps (per master blueprint): /community page (text posts + political tags), /agent panel (CSV upload, leads, news/blog editor), YouTube sync, and wiring the announcement ticker to the admin-controlled Setting value.

---
Task ID: 7
Agent: orchestrator (main)
Task: Build the Agent Panel (/agent) — CSV bulk upload, lead tracking, news/blog rich text editor.

Work Log:
- Task 7-a: Installed papaparse + @types/papaparse. Added agent role helpers to src/lib/session.ts: isAgentRole (AGENT or ADMIN), requireApiAgent (API 403), requireAgent (Server Component redirect).
- Task 7-b: Agent backend APIs (all session-guarded via requireApiAgent):
  - POST /api/agent/csv-import — papaparse server-side parse, header mapping (name/title, category, phone, whatsapp, address, location, village, email, website, description/about, map/maplink), bulk-insert as PENDING listings, category/village name→id lookup. Returns {added, skipped, errors}.
  - GET /api/agent/leads — analytics for the agent's own listings: total views, WhatsApp clicks, total clicks, approved/pending counts, per-listing breakdown, recent leads.
  - POST /api/agent/news (type: news|blog) — creates post with status PENDING (isPublished:false), auto-slug, R2 image. GET /api/agent/news?type= lists own posts. DELETE /api/agent/news/[id]?type= deletes post + R2 image.
- Task 7-c: src/app/agent/page.tsx — server component with requireAgent guard (redirect /login or /).
- Task 7-d: src/components/agent/agent-panel.tsx — 3 tabs:
  - CSV Import: drag-drop zone (.csv), file preview, Download Template button, column-mapping help, success toast with count.
  - Leads: 4 stat cards (total listings, views, WhatsApp clicks, total clicks) + per-listing performance table with status badges + links to /business/[slug].
  - News & Blog Editor: WordPress/Blogger-style two-column — main editor (title, auto-slug, rich content) + sidebar (Publish, Featured Image R2 upload, SEO meta title/description, tags). Existing posts list with delete. News/Blog type toggle.
- Task 7-e: src/components/agent/rich-text-editor.tsx — lightweight contentEditable + execCommand editor (deliberately avoids Tiptap/Lexical to keep the 4GB host stable). Toolbar: H1, H2, Bold, Italic, Bullet/Numbered lists, Blockquote, Table (rows×cols prompt), Link, Undo/Redo. Styled tables/quotes/headings via Tailwind arbitrary variants on the editable surface.
- Fix: removed invalid `include: { listing }` from leads query (Lead.listingId has no relation — plain field).
- Lint fixes: refactored LeadsTab/EditorTab useEffect to avoid setState-in-effect rule; inlined rich-text toolbar buttons to avoid react-hooks/refs rule (handlers that close over ref must be in event handlers, not passed as props).

Verification (via curl — 4GB sandbox OOMs under concurrent compiles):
- /agent without auth → 307 redirect /login ✓
- Login (demo@choutuppal.app / demo1234, ADMIN) → 200 ✓
- /agent with admin session → 200, 46KB, all 3 tabs (CSV Import, Leads, News & Blog) ✓
- /api/agent/leads → 200 {totalListings:9, approved:9, totalViews:2326, per-listing breakdown...} ✓
- CSV import (3 rows: Test CSV Shop 1/2/3) → {ok:true, added:3, skipped:0, errors:[]} ✓
- POST /api/agent/news (news) → 201 {slug:'test-news-from-agent', isPublished:false, content preserved with HTML} ✓
- bun run lint → clean (0 errors, 0 warnings)

Stage Summary:
- Agent panel complete and verified. Committed locally. .env untracked (secrets protected).
- The platform now has all 6 main routes: Home (/), Login (/login), Dashboard (/dashboard), Business mini-website (/business/[slug]), Admin (/admin), Agent (/agent).
- Demo login: demo@choutuppal.app / demo1234 (ADMIN role — can access both /admin and /agent).
- Known limitation: 4GB sandbox OOM-kills the dev server when multiple fresh route compiles happen concurrently. All verification done via curl with cookie handling. The app runs stably for normal single-user preview.
- Remaining blueprint items: /community page (text posts + political tags BJP/Congress/BRS/CPM, public profiles only), YouTube sync for Shorts, and wiring the admin-controlled announcement_ticker Setting to the home Ticker component.

---
Task ID: 8
Agent: orchestrator (main)
Task: Build the Community Page (/community) and User Profile Page (/profile/[username]) — the final major routes.

Work Log:
- Task 8-a: Schema changes — added User.politicalTag field (NONE|BJP|CONGRESS|BRS|CPM, default NONE) for profile card badge. Added CommunityLike model (userId+postId unique) for proper like toggle. Added CommunityPost.likesRel relation. Pushed schema, re-seeded (8 listings, 4 RE, 6 stories, 3 banners, 4 shorts) + created 4 community posts + a private test user.
- Task 8-b: Community APIs (all in /api/community/):
  - GET /api/community/posts — public feed (only public, non-banned authors), ?tag= filter, includes author (public fields), comment count, likedByMe (if viewer logged in)
  - POST /api/community/posts — create (logged-in only), content + politicalTag
  - DELETE /api/community/posts/[id] — owner or admin
  - POST /api/community/posts/[id]/like — toggle (CommunityLike upsert + increment/decrement counter)
  - GET/POST /api/community/posts/[id]/comments — list + add (logged-in for add)
  - GET /api/community/people — public users directory, excludes viewer, ?q= search
- Task 8-c: Community page (src/app/community/page.tsx, server component) + client feed component (src/components/community/community-feed.tsx):
  - Text-only post composer (textarea, max 2000, political tag dropdown)
  - Vertical feed of post cards: avatar (initials fallback), name, political tag badge, text, timestamp, like toggle, comment section
  - Like button toggles (filled heart when liked), shows count
  - Comments: expandable section, list + input (Enter to submit), author + tag badge
  - Tag filter chips (All/BJP/Congress/BRS/CPM) above feed
  - People Directory sidebar: glassmorphism cards (photo, name, bio, tag dot) → /profile/[username]
  - Shared tag-styles.ts: colored badges (BJP=orange, Congress=sky, BRS=pink, CPM=red)
- Task 8-d: Profile page (src/app/profile/[username]/page.tsx, server component with generateMetadata + private check) + client component (src/components/community/profile-view.tsx):
  - generateMetadata: absolute OG url, OG type=profile, OG image (profile photo), title, description — WhatsApp preview ready
  - Fetch by username; if isPublic=false and viewer not owner/admin → "This profile is private" state (not 404)
  - Portfolio layout: cover banner + overlapping profile photo, name, bio, political tag badge, village, post/listing/property counts
  - 3 tabs: Posts (their community posts), Listings (approved businesses → /business/[slug]), Real Estate (approved properties → /business/[slug])

Verification (via curl — 4GB sandbox OOMs under concurrent compiles):
- /community → 200, 42KB. Sections: Community, Choutuppal Feed, People you might know, tag chips BJP/Congress/BRS ✓
- /profile/choutuppal_demo → 200, 54KB. SEO title "Choutuppal Demo | Choutuppal App", OG url absolute, OG type=profile ✓
- /profile/privateuser → 200, "This profile is private" (non-owner view) ✓
- Login (demo@choutuppal.app / demo1234) → 200 ✓
- Create post (BJP tag) → 201 {politicalTag:"BJP"} ✓
- Like toggle → 200 {liked:true, likes:1} → toggle again → {liked:false, likes:0} ✓
- bun run lint → clean (0 errors, 0 warnings)

Stage Summary:
- Community + Profile complete and verified. Committed locally. .env untracked (secrets protected).
- The platform now has ALL major routes from the blueprint: Home (/), Login (/login), Dashboard (/dashboard), Business mini-website (/business/[slug]), Admin (/admin), Agent (/agent), Community (/community), Profile (/profile/[username]).
- Demo login: demo@choutuppal.app / demo1234 (ADMIN, owns 8 listings + 4 properties + community posts).
- Known limitation: 4GB sandbox OOM-kills the dev server under concurrent route compiles. All verification done via curl. The app runs stably for normal single-user preview.
- Remaining polish items (optional): wire the admin-controlled announcement_ticker Setting to the home Ticker component; YouTube sync for Shorts; the /admin approve flow already creates notifications but there's no notifications dropdown yet.
