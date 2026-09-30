# Infriva Solutions — Comprehensive Architecture, Security & Codebase Master Audit Report (Round 2)

**Repository:** `c:\Users\arpan\OneDrive\Desktop\code\infriva`  
**Date of Audit:** September 29, 2026  
**Auditor:** Antigravity AI Investigation Specialist  
**Methodology:** Primary-source static AST analysis, line-by-line verification, dependency cross-referencing, binary asset metadata inspection, Next.js 16/React 19 framework conformance, and accessibility (WCAG 2.1 AA) evaluation.

---

## Executive Summary

A zero-omission, 100% comprehensive re-audit was executed across the entire Infriva Solutions codebase, encompassing all 3 API routes, 5 library modules, 8 UI components, 11 App Router page views, layout and styling pipelines, media assets, configuration files, and security models.

Every claim from prior investigations was independently verified against primary source code. In this second round, critical new findings and subtle bugs previously overlooked have been uncovered, including:
1. **Chatbot API First-Turn Role Invariant Violation:** Gemini strictly requires `contents[0].role === 'user'`, but the chatbot route permits arbitrary role ordering leading to API 400 errors.
2. **Contact Form Dropdown State De-synchronization:** Native `form.reset()` leaves custom React dropdowns unreset, displaying stale selections after submission.
3. **Overlapping Comboboxes & Complete Keyboard Inaccessibility:** Multiple dropdowns stay open simultaneously; no click-outside dismiss, no `Escape` or arrow-key navigation.
4. **Missing Route Error Handling & System Boundaries:** Missing `not-found.tsx`, `error.tsx`, and `global-error.tsx` across the App Router.
5. **Zero Sitemaps or Robots Directives:** Digital agency selling SEO lacks `sitemap.ts` and `robots.ts`.
6. **Dead Dependencies in `package.json`:** `clsx` and `tailwind-merge` are installed but unused anywhere in `src/`.
7. **Phantom Unsplash Remote Pattern:** `images.unsplash.com` configured in `next.config.ts` while zero external images exist.

---

## 1. Challenge & Verification of Prior Attempt Findings

| Prior Claim | Prior Evidence Cited | Primary Source Code Reality | Status & Corrected Finding |
| :--- | :--- | :--- | :--- |
| **1. Premature HTML Entity Escaping** | `api/contact/route.ts:39-46` | Line 39 sanitizes strings to HTML entities before Supabase insert, email headers, and WhatsApp plain text. | **Verified & Expanded:** In addition, the route performs **zero schema validation** (no check for empty strings, missing fields, or valid email syntax) and catches Resend errors silently, returning `{ success: true }` even when emails fail. |
| **2. In-Memory Rate Limiting on Serverless** | `api/contact/route.ts:8-23` | `rateLimitMap` is an in-memory `Map`. Resets on cold boot, isolated per serverless lambda instance. | **Verified & Expanded:** Furthermore, the `Map` never purges expired keys, causing memory leaks in long-lived Node worker processes. |
| **3. Client IP Spoofing via `x-forwarded-for`** | `api/contact/route.ts:27` | Takes leftmost IP without edge proxy validation. | **Verified:** Attacker can rotate spoofed `X-Forwarded-For` headers to bypass rate limits. |
| **4. Resend Sandbox Domain Rejection** | `api/contact/route.ts:69, 90` | Uses `onboarding@resend.dev` for external recipient `to: email`. | **Verified:** Resend API blocks delivery to external recipients with HTTP 403 Forbidden. Also, admin address `info@infrivasolutions.com` will fail unless it matches the Resend account owner's email. |
| **5. Serverless Background Promise Termination** | `api/meta/webhook/route.ts:72-85` | Unawaited `generateContent().then(...)` background promise followed by synchronous `NextResponse(200)`. | **Verified & Expanded:** Serverless execution context freezes immediately on return. Crucially, `@vercel/functions` is **not installed** in `package.json`, so `waitUntil` cannot be imported without updating dependencies or using Next.js 15+ `after()` from `next/server`. |
| **6. Meta Messenger Echo Loop** | `api/meta/webhook/route.ts:58-87` | Missing `if (webhookEvent.message.is_echo) continue;`. | **Verified:** Bot responds to its own outbound messages recursively, exhausting Gemini token quotas and incurring Meta Graph API rate blocks. |
| **7. Timing Attack on HMAC Verification** | `api/meta/webhook/route.ts:48-52` | `signature !== digest` uses standard string comparison. | **Verified:** Leaks byte timing information. |
| **8. WhatsApp Batch Truncation** | `api/meta/webhook/route.ts:95-96` | Hardcoded `value.messages[0]` index. | **Verified:** Drops messages at index 1+ in multi-message webhook payloads. |
| **9. Chat API Architecture & Guardrails** | `api/chat/route.ts:33-45` | Bypasses `gemini.ts`, lacks system instruction, lacks rate limiting. | **Verified & Expanded:** Fails Gemini's mandatory invariant that `contents[0].role` must be `'user'`. If the client passes a bot greeting first, Gemini throws HTTP 400. |
| **10. Supabase Public Key on Backend** | `lib/supabase.ts:3-7` | Singleton initialized with `NEXT_PUBLIC_SUPABASE_ANON_KEY`. | **Verified:** Backend writes bypass proper authorization; exposing anon key allows unauthorized DB read/write if RLS is improperly configured. |
| **11. PostHog PII & Dev Server Crash** | `lib/posthog-ai.ts:27-37` | Top-level `throw new Error()` in development if keys are absent; logs cleartext PII with `privacyMode: false`. | **Verified:** Prevents local development without PostHog credentials; streams customer phones/emails unredacted. |
| **12. Meta API Message Length Limits** | `lib/meta.ts:20, 30` | Lacks truncation at 2,000 (Messenger) or 4,096 (WhatsApp) characters. | **Verified:** Long AI responses trigger Meta HTTP 400 rejection. |
| **13. Scroll Layout Thrashing** | `Navigation.tsx:51-99` | Synchronous `elementsFromPoint` and `getComputedStyle` on every scroll event tick. | **Verified:** Causes severe forced reflows and frame drops on 60–120Hz displays. |
| **14. Preloader Timing & Navigation Delay** | `Preloader.tsx:16-20` vs `page.tsx:130, 137` | Hardcoded `delay={2.6}` and `delay={2.7}` on subtitle and CTA. | **Verified:** Subtitle and CTA take 2.7s to appear on client-side revisit to `/`. Initial headline animation plays hidden behind the opaque preloader. |
| **15. Monolithic `"use client"` & SEO Loss** | `src/app/**/page.tsx:1` | 6 primary pages marked `"use client"`; 0 out of 11 pages define route metadata. | **Verified:** All routes render identical default title `"Infriva | Premium Digital Architecture"`. |
| **16. Soft 404s on Dynamic Slugs** | `services/[slug]`, `blog/[slug]` | Renders fallback UI with HTTP 200 instead of `notFound()`. | **Verified:** Pollutes search index with soft 404s. |
| **17. Dead CSS Classes** | Multiple files | `animate-in`, `fade-in`, `zoom-in-95`, `prose`, `border-t-hairline`. | **Verified:** Required plugins (`tailwindcss-animate`, `@tailwindcss/typography`) are not installed. |
| **18. SynthID Digital Watermarks** | `public/images/*.jpg` | All 12 JPEG images carry Google SynthID watermarks. | **Verified:** Google DeepMind SynthID metadata and visual corner artifacts present. |
| **19. Extreme Aspect Ratio Mismatch** | `stone-staircase.jpg` | Dimensions `664 x 4367` (1:6.58) in widescreen containers. | **Verified:** Vertical ribbon image severely cropped in horizontal bento and 16:9 boxes. |

---

## 2. In-Depth Scrutiny: New Findings & Uncovered Gaps

### 2.1 Backend API Routes

#### A. `src/app/api/chat/route.ts`
1. **Gemini Invariant Violation — Role Sequence:**
   - **File & Lines:** [`src/app/api/chat/route.ts:23-26`](file:///c:/Users/arpan/OneDrive/Desktop/code/infriva/src/app/api/chat/route.ts#L23-L26)
   - **Code:**
     ```ts
     const contents = messages.map((msg: { role: string; content: string }) => ({
       role: msg.role === 'bot' ? 'model' : 'user',
       parts: [{ text: msg.content }]
     }));
     ```
   - **Vulnerability:** Gemini API v1beta requires `contents[0].role === 'user'`. If the client submits an initial greeting from the assistant or a malicious actor sends `[{ role: 'bot', content: 'hi' }]`, the Gemini endpoint immediately returns HTTP 400 Bad Request: `"Invalid argument: contents[0].role must be 'user'"`. The UI then displays `"The AI is currently experiencing high demand. Please try again momentarily."`
2. **Missing Request Payload Validation & Memory Exhaustion:**
   - The route does not enforce a maximum length on the `messages` array or characters per message. An attacker can transmit tens of thousands of tokens, exhausting server memory and exhausting Gemini API quotas.
3. **No Timeout Configuration on Upstream `fetch`:**
   - The REST call to Google's API lacks an `AbortController` timeout signal. If Google's endpoint stalls, the serverless function hangs until platform timeout (15s–60s).

#### B. `src/app/api/contact/route.ts`
1. **Total Absence of Schema Validation:**
   - **File & Lines:** [`src/app/api/contact/route.ts:40-46`](file:///c:/Users/arpan/OneDrive/Desktop/code/infriva/src/app/api/contact/route.ts#L40-L46)
   - **Vulnerability:** The route extracts fields from `data` without checking if `data` is an object, or verifying that required fields (`name`, `email`, `service`) are non-empty strings. Submitting `{}` succeeds with HTTP 200, creating blank database records and sending emails with empty recipient/subject lines.
2. **False Positive Success Reporting:**
   - **File & Lines:** [`src/app/api/contact/route.ts:84-87, 104-107, 129`](file:///c:/Users/arpan/OneDrive/Desktop/code/infriva/src/app/api/contact/route.ts#L84-L87)
   - **Vulnerability:** Both email promises catch errors and return `null`. Even if Resend rejects with HTTP 403/401, the endpoint returns `NextResponse.json({ success: true }, { status: 200 })`. Users receive confirmation that their inquiry was sent, while the message was dropped.
3. **Honeypot Accessibility & Bot Evasion:**
   - **File & Lines:** [`src/app/contact/page.tsx:206`](file:///c:/Users/arpan/OneDrive/Desktop/code/infriva/src/app/contact/page.tsx#L206)
   - `<input type="text" name="_hp_website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />`
   - Spambots detect `className="hidden"` (`display: none`) and skip the field. Conversely, autofill utilities (e.g. browser password managers) may fill fields matching `*website*`, causing legitimate customer inquiries to be silently dropped.

#### C. `src/app/api/meta/webhook/route.ts`
1. **Unprotected Asynchronous Execution Environment:**
   - **File & Lines:** [`src/app/api/meta/webhook/route.ts:74-88, 111-126`](file:///c:/Users/arpan/OneDrive/Desktop/code/infriva/src/app/api/meta/webhook/route.ts#L74-L88)
   - Vercel Serverless runtimes freeze active Node processes upon response return. Neither `@vercel/functions` `waitUntil()` nor Next.js 15+ `after()` is utilized. Promises dispatched in background threads are terminated.
2. **Synchronous Supabase Database Bottleneck in Webhook:**
   - **File & Lines:** [`src/app/api/meta/webhook/route.ts:67, 104`](file:///c:/Users/arpan/OneDrive/Desktop/code/infriva/src/app/api/meta/webhook/route.ts#L67)
   - Inbound logging `await logChatMessage(...)` is executed synchronously inside the request loop. If Supabase encounters latency or cold boot delays exceeding 20s, Meta marks the webhook as timed out and re-delivers the event, leading to duplicate processing.

---

### 2.2 Libraries & State Architecture

#### A. `src/lib/gemini.ts`
1. **API Key Exposed in URL Query Parameters:**
   - **File & Lines:** [`src/lib/gemini.ts:28`](file:///c:/Users/arpan/OneDrive/Desktop/code/infriva/src/lib/gemini.ts#L28)
   - **Code:** `endpoint = https://generativelanguage.googleapis.com/...:generateContent?key=${apiKey}`
   - **Risk:** Passing secrets in query strings exposes credentials in proxy access logs, CDN logs, browser histories, and HTTP referrer headers. `api/chat/route.ts` uses `x-goog-api-key` in headers, demonstrating inconsistent credential management.
2. **Single-Turn Stateless Conversation Execution:**
   - `gemini.ts` only passes `contents: [{ role: "user", parts: [{ text: message }] }]`. It carries zero chat history memory. Multi-turn interactions on WhatsApp or Messenger have no contextual recall.

#### B. `src/lib/posthog-ai.ts`
1. **Development Server Boot Blocker:**
   - **File & Lines:** [`src/lib/posthog-ai.ts:27-33`](file:///c:/Users/arpan/OneDrive/Desktop/code/infriva/src/lib/posthog-ai.ts#L27-L33)
   - Throwing uncaught errors at module evaluation time prevents any team member or CI runner from executing `npm run dev` or tests without valid PostHog credentials.
2. **Blocking Telemetry Flush:**
   - **File & Lines:** [`src/lib/posthog-ai.ts:88`](file:///c:/Users/arpan/OneDrive/Desktop/code/infriva/src/lib/posthog-ai.ts#L88)
   - `await posthog.flush()` forces an outbound HTTP request on every captured generation, introducing latency to every chat interaction.

#### C. `src/lib/supabase.ts`
1. **Missing Service Role Separation & Lack of Database Types:**
   - The client is initialized with non-null assertion `!` without fallback or validation.
   - Using the public anon key for backend administrative inserts requires loosening RLS rules.
   - All queries return `any` because no Database generic type is supplied to `createClient`.

---

### 2.3 UI Components & Client Usability

#### A. `src/components/ui/Navigation.tsx`
1. **Forced Synchronous Layout (Reflow):**
   - **File & Lines:** [`src/components/ui/Navigation.tsx:51-99`](file:///c:/Users/arpan/OneDrive/Desktop/code/infriva/src/components/ui/Navigation.tsx#L51-L99)
   - On every scroll event: executes `document.elementsFromPoint` twice and `window.getComputedStyle` on all matched elements to parse background luminance. This forces immediate layout recalculation, dropping frame rates during scrolling.
2. **Accessible Name Omission on Logos:**
   - Navigation logo (`line 144`) and Footer logo (`Footer.tsx:9`) wrap `<LogoHorizontal />` inside `<Link href="/">` without `aria-label="Infriva Home"`. Screen readers announce an unlabelled link.
3. **Missing Conversion CTA in Mobile Menu:**
   - The desktop navigation pill features a high-prominence `"Start a project"` CTA. The mobile drawer (`lines 229-255`) completely omits this button, lowering mobile conversion potential.

#### B. `src/components/ui/Chatbot.tsx`
1. **Missing Auto-Scroll Behavior:**
   - The chat message container (`line 84`) does not automatically scroll down when new messages are added. Users must manually scroll to view AI responses.
2. **Sub-44px Touch Targets & Missing Accessible Labels:**
   - Chatbot header close button (`line 76`) has an 18×18px hit target with no `aria-label`.
   - Submit button (`line 127`) is 40×40px with no `aria-label`.

#### C. `src/app/contact/page.tsx` (`CustomSelect`)
1. **Form Reset De-synchronization Bug:**
   - When `(e.target as HTMLFormElement).reset()` is called at line 130, native inputs clear, but `CustomSelect` retains its internal `selected` state. Stale dropdown values remain visible in the UI after submission.
2. **Simultaneous Dropdown Collisions & Missing Click-Outside:**
   - `CustomSelect` lacks a `mousedown` listener to detect clicks outside the element.
   - If a user clicks "Service Required" and then clicks "Budget Range", both dropdown menus remain open simultaneously, overlapping and obscuring form fields.
3. **Keyboard Accessibility Gaps:**
   - Combobox only handles `Enter` and `Space`. It does not support `Escape` to close, nor `ArrowDown`/`ArrowUp` to navigate options.

---

### 2.4 App Router Pages & Architecture

#### A. Monolithic `"use client"` Anti-Pattern & Total SEO Failure
- **Routes Affected:** `/` (`page.tsx`), `/about`, `/services`, `/projects`, `/blog`, `/contact`.
- **Finding:** Every single main landing page begins with `"use client";`. In Next.js App Router, Client Components are strictly forbidden from exporting `metadata` or `generateMetadata`.
- **Systemic Impact:**
  - Exactly **0 out of 11 routes** define page-specific metadata.
  - Every page across the site has the identical `<title>Infriva | Premium Digital Architecture</title>` and description.
  - OpenGraph cards on Twitter, LinkedIn, and WhatsApp display identical home information for blog posts and project case studies.

#### B. Dynamic Route Soft 404s & Incomplete View Templates
1. **Soft 404 HTTP 200 Status:**
   - `/services/[slug]/page.tsx:118` and `/blog/[slug]/page.tsx:138` render fallback JSX with HTTP 200 OK instead of calling Next.js `notFound()`.
2. **Missing Hero Images in Service Details:**
   - In `services/[slug]/page.tsx`, the `servicesData` dictionary defines `image?: string` for 5 services, but the page JSX never renders `data.image`.
3. **Severe Aspect Ratio Distortion:**
   - `projects/[slug]/page.tsx:210` renders `stone-staircase.jpg` inside an `aspect-[16/9]` widescreen container. The image's native dimension is `664 x 4367` (1:6.58 ratio), resulting in extreme vertical cropping.

#### C. Missing Application Boundaries & SEO Infrastructure
1. **Missing Error & 404 Boundaries:**
   - The repository lacks `src/app/not-found.tsx`, `src/app/error.tsx`, and `src/app/global-error.tsx`. Uncaught exceptions or 404s fall back to unstyled, default Next.js screens.
2. **Missing XML Sitemap & Robots Directives:**
   - No `sitemap.ts` or `robots.ts` exists in `src/app`. Search engine crawlers have no sitemap index.
3. **Missing PWA / Web Manifest:**
   - No `manifest.json` or `manifest.ts` exists in the repository.

---

### 2.5 Media Assets, Build & Dependencies

1. **Dead Dependencies in `package.json`:**
   - `clsx` and `tailwind-merge` are installed in `package.json`, but are not imported anywhere in `src/`.
2. **Unreferenced Orphan Assets in `public/`:**
   - `public/hero-bg.mp4` (**4.23 MB**) is never referenced in source code.
   - `public/images/digital-system.jpg` (**137 KB**) is never referenced.
   - `public/logo.png` (**83.3 KB**) and `public/logo.svg` (**14.9 KB**) are unreferenced.
   - Default boilerplate SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) remain in `public/`.
3. **Uncompressed Hero Video:**
   - `public/hero-bg-v2.mp4` (**7.35 MB**) autoplays on mobile networks with no WebM/AV1 alternative or data-saver fallback. If autoplay is blocked by Low Power Mode, the poster falls back to a blank beige SVG rectangle.
4. **Phantom Unsplash Domain in `next.config.ts`:**
   - `next.config.ts` configures `images.unsplash.com` under `remotePatterns`, but zero Unsplash images are used in the codebase.
5. **Hardcoded Google Analytics:**
   - Script ID `G-FMQLX056JX` is embedded in `layout.tsx` without environment variable abstraction or cookie consent guards.

---

## 3. Prioritized Remediation Blueprint

| Level | Category | File Path | Defect | Solution |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | **Security / Loop** | `src/app/api/meta/webhook/route.ts` | Messenger bot-to-bot echo loop. | Add `if (webhookEvent.message.is_echo) continue;` |
| **P0** | **Runtime / Loss** | `src/app/api/meta/webhook/route.ts` | Serverless async termination. | Wrap in `waitUntil()` from `@vercel/functions` or Next.js `after()`. |
| **P0** | **Security** | `src/app/api/meta/webhook/route.ts` | Timing attack on HMAC signature. | Replace string comparison with `crypto.timingSafeEqual()`. |
| **P0** | **Data Integrity** | `src/app/api/contact/route.ts` | Premature HTML entity escaping corrupts DB & WhatsApp. | Escape only inside HTML email templates, not before DB insert. |
| **P0** | **API Guardrails** | `src/app/api/chat/route.ts` | Invariant role error & missing system prompt. | Enforce `contents[0].role === 'user'`, add system instructions and rate limiting. |
| **P0** | **Database Security**| `src/lib/supabase.ts` | Public anon key used for backend writes. | Implement separate server client using `SUPABASE_SERVICE_ROLE_KEY`. |
| **P1** | **Performance** | `src/components/ui/Navigation.tsx` | Layout thrashing on scroll. | Replace `elementsFromPoint` with `IntersectionObserver` or CSS blend modes. |
| **P1** | **SEO / SSR** | `src/app/**/page.tsx` | Monolithic `"use client"` blocks metadata. | Convert root pages to Server Components, export metadata, extract client islands. |
| **P1** | **UX / Stalling** | `src/app/page.tsx` | Hardcoded 2.6s/2.7s delays on revisit. | Bind delays to `isInitialLoad` condition. |
| **P1** | **Brand Assets** | `public/images/*.jpg` | SynthID AI watermarks & distorted ratio. | Replace with authentic photography, correct `stone-staircase.jpg` dimensions. |
| **P1** | **Routing / SEO** | `services/[slug]`, `blog/[slug]` | Soft 404 HTTP 200 responses. | Import and invoke Next.js `notFound()`. |
| **P2** | **Form UX** | `src/app/contact/page.tsx` | `CustomSelect` desync on submit & overlapping menus. | Add click-outside listener, keyboard navigation, and sync state with form reset. |
| **P2** | **Chatbot UX** | `src/components/ui/Chatbot.tsx` | Missing auto-scroll & sub-44px touch targets. | Add scroll ref to message list, expand button hitboxes to min 44px. |
| **P2** | **Media Cleanup** | `public/` | 11.6 MB of heavy/orphaned video and assets. | Delete `hero-bg.mp4`, unused SVGs/PNGs, provide WebM video formats. |
| **P2** | **Dependencies** | `package.json`, `globals.css` | Dead prose & animate classes; unused deps. | Install `@tailwindcss/typography`, prune `clsx` and `tailwind-merge`. |
| **P2** | **SEO Infrastructure**| `src/app/` | Missing sitemap, robots, error boundaries. | Add `sitemap.ts`, `robots.ts`, `not-found.tsx`, `error.tsx`. |

---

## Remaining Questions & Gaps

1. **Supabase Production RLS & Access Policies:**
   - **Unanswered:** Direct live database schema inspection is unavailable without administrative Supabase management credentials.
   - **Assessment:** Regardless of current DB state, utilizing the public anon key on the backend creates an inherent security risk. Creating a backend-only Service Role client is mandatory.
2. **Resend Production Domain Verification:**
   - **Unanswered:** Whether `infrivasolutions.com` is already configured in the user's Resend dashboard.
   - **Assessment:** Hardcoding `onboarding@resend.dev` will fail in production. An environment variable (`RESEND_FROM_EMAIL`) must be configured.
3. **Authentic Photography & Brand Video Sourcing:**
   - **Unanswered:** Whether the client has original high-resolution studio assets to replace the 12 SynthID-watermarked images and 7.35 MB background video.
   - **Focus for Follow-up:** Client procurement of compressed WebP/AVIF imagery and optimized short video clips.
