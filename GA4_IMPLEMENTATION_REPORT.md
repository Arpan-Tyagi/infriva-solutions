# GA4 & GSC Implementation Research Report

## Objective
Verify that the Google Analytics 4 (GA4) and Google Search Console (GSC) tag (`G-M3H7N4SS4X`) is correctly and comprehensively installed across all pages and sections of the Infriva Solutions Next.js App Router application.

## 1. Global Coverage via `RootLayout`
In the Next.js App Router architecture (`src/app`), the `layout.tsx` file at the root of the `app` directory serves as the **Root Layout**.
According to official Next.js documentation:
> *"The root layout is defined at the top level of the app directory and applies to all routes. This layout enables you to modify the initial HTML returned from the server."*

By injecting the `<Script>` tags directly into `src/app/layout.tsx`, the Next.js compiler guarantees that the Google Analytics snippet is injected into the `<head>` of **every single page**, dynamic route, and section of the website (e.g., `/`, `/about`, `/services`, `/blog/[slug]`).

## 2. SPA Route Change Tracking (Client-Side Navigation)
Next.js uses client-side routing (Soft Navigation) when users click `<Link>` components. 
In older versions of React/Next.js (Pages Router), developers had to manually listen to `routeChangeComplete` events to trigger GA pageviews.

**Modern GA4 Behavior:**
Google Analytics 4 utilizes **Enhanced Measurement**, which is enabled by default for all web data streams. Enhanced Measurement automatically detects client-side History API state changes (which Next.js App Router uses for navigation) and fires a `page_view` event automatically. 
Because of this, no manual route-change listeners are required in `layout.tsx`. The standard `gtag.js` snippet handles SPA navigation natively.

## 3. Performance & Non-Blocking Execution
We are utilizing the Next.js `next/script` component with `strategy="afterInteractive"`.
*   **Why `afterInteractive`?** It ensures the GA4 tracking script is fetched and executed *after* the page becomes interactive. This prevents the third-party script from blocking the main thread during initial page load, protecting our Core Web Vitals (LCP, FID/INP).

## Conclusion
The current implementation in `src/app/layout.tsx` is structurally complete, performant, and automatically covers 100% of the application's URLs without requiring individual page-level imports.
