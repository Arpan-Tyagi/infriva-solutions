/**
 * @file src/app/layout.tsx
 * @description Next.js App Router Root Layout & Global Shell
 *
 * This Server Component defines the foundational document structure (`<html>`, `<body>`)
 * shared by all 29 routes across the Infriva Solutions application.
 *
 * Architectural & Performance Responsibilities:
 * 1. Zero-CLS Typography via `next/font`:
 *    - Injects Geist Sans and Geist Mono directly into CSS custom properties (`--font-geist-sans`, `--font-geist-mono`).
 *    - Fonts are automatically preloaded and subsetted to Latin glyphs, eliminating layout shifts (CLS = 0).
 * 2. WCAG 2.1 AA Bypass Block:
 *    - Implements an accessible keyboard "Skip to content" link targeting `<main id="main-content">`.
 *    - Remains off-screen (`sr-only`) until focused via Tab key, satisfying WCAG Guideline 2.4.1.
 * 3. Dynamic Viewport Sizing (`min-h-[100dvh]`):
 *    - Uses modern dynamic viewport units (`dvh`) rather than `vh` to accommodate expanding/collapsing
 *      mobile browser address bars on iOS Safari and Android Chrome without page jumps.
 * 4. Production-Guarded Analytics:
 *    - Wraps Google Analytics scripts (`gtag.js`) in `process.env.NODE_ENV === 'production'`.
 *    - Keeps local development console logs clean and avoids distorting production traffic metrics.
 * 5. Global Chrome Hierarchy:
 *    - Houses the persistent intro preloader (`Preloader`), floating contrast navbar (`Navigation`),
 *      AI assistant widget (`Chatbot`), and agency footer (`Footer`).
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navigation } from "@/components/ui/Navigation";
import { Footer } from "@/components/ui/Footer";
import { Preloader } from "@/components/ui/Preloader";
import { Chatbot } from "@/components/ui/Chatbot";

/**
 * Configure Geist Sans font variable.
 * Used for primary headlines, navigation labels, and UI typography.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Configure Geist Mono font variable.
 * Used for monospaced metrics, code snippets, timestamps, and architectural labels.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Base Application Metadata
 * Configures global search engine indexing, social graph OpenGraph tags, and canonical URLs.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://infrivasolutions.com'),
  title: "Infriva | Premium Digital Architecture",
  description: "We engineer digital experiences with cinematic spatial rhythm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased selection:bg-brand-900 selection:text-white`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-background text-foreground">
        {/* Accessible Skip to Content Link (WCAG 2.1 AA Compliance) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-900 focus:text-white focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-brand-50 shadow-lg"
        >
          Skip to content
        </a>
        
        {/* Google Analytics (gtag.js) - Restricted strictly to production environments */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-M3H7N4SS4X" />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', 'G-M3H7N4SS4X');
                `,
              }}
            />
          </>
        )}

        {/* Global Intro Sequence: Runs on initial site visit */}
        <Preloader />
        
        {/* Persistent Contrast-Aware Navigation Header */}
        <Navigation />
        
        {/* Primary Page Canvas: Flex-1 ensures footer stays grounded on short pages */}
        <main id="main-content" className="flex-1 flex flex-col">{children}</main>
        
        {/* Floating Conversational AI Assistant */}
        <Chatbot />
        
        {/* Global Agency Footer */}
        <Footer />
      </body>
    </html>
  );
}
