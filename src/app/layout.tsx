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
import { PostHogProvider } from "./providers";
import { AGENCY_NAP, SITE_URL, buildGlobalGraphJsonLd } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Infriva Solutions | B2B Digital Systems, Custom CRM & SEO/GEO Engineering",
    template: "%s | Infriva Solutions",
  },
  description: AGENCY_NAP.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: AGENCY_NAP.name,
    title: "Infriva Solutions | B2B Digital Systems, Custom CRM & SEO/GEO Engineering",
    description: AGENCY_NAP.description,
    images: [
      {
        url: "/images/glass-panels.jpg",
        width: 1200,
        height: 630,
        alt: "Infriva Solutions — B2B Digital Architecture & Revenue Engineering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infriva Solutions | B2B Digital Systems, Custom CRM & SEO/GEO Engineering",
    description: AGENCY_NAP.description,
    images: ["/images/glass-panels.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalJsonLd = buildGlobalGraphJsonLd();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased selection:bg-brand-900 selection:text-white`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
        <PostHogProvider>
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
        </PostHogProvider>
      </body>
    </html>
  );
}
