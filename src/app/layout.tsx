import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navigation } from "@/components/ui/Navigation";
import { Footer } from "@/components/ui/Footer";
import { Preloader } from "@/components/ui/Preloader";
import { Chatbot } from "@/components/ui/Chatbot";

// Initialize the Geist Sans font with Next.js optimization.
// The variable property sets a CSS variable name (--font-geist-sans) 
// that we can reference in Tailwind for the primary font family.
const geistSans = Geist({
  variable: "--font-geist-sans", // CSS variable mapped in Tailwind config
  subsets: ["latin"], // Preload the latin subset for optimal loading speed
});

// Initialize the Geist Mono font for monospaced text elements (like code or specific data points).
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // CSS variable mapped in Tailwind config
  subsets: ["latin"], // Preload the latin subset
});

// Define the global Next.js metadata which populates the <head> tags.
// This handles SEO basics like the default page title and meta description.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://infrivasolutions.com'),
  title: "Infriva | Premium Digital Architecture", // Primary title tag
  description: "We engineer digital experiences with cinematic spatial rhythm.", // Meta description tag
};

// The RootLayout is a special Next.js Server Component that wraps every page in the app.
// It defines the core HTML structure (html, body) and shared UI elements (Nav, Footer).
export default function RootLayout({
  children, // The currently active page component is passed as children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The html tag includes language and sets up global font variables.
    // 'antialiased' makes fonts smoother on macOS/iOS.
    // 'selection:' classes change the text highlight color globally.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased selection:bg-brand-900 selection:text-white`}
    >
      {/* Body sets the minimum height to viewport height and uses flex column layout
          to push the footer to the bottom naturally. Background and text colors come from global CSS variables. */}
      <body className="min-h-[100dvh] flex flex-col bg-background text-foreground">
        {/* Accessible Skip to Content Link (WCAG 2.1 AA) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-900 focus:text-white focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-brand-50 shadow-lg"
        >
          Skip to content
        </a>
        
        {/* Google Analytics (gtag.js) - production only */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-FMQLX056JX" />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', 'G-FMQLX056JX');
                `,
              }}
            />
          </>
        )}

        {/* Preloader component handles the initial loading animation for the entire site */}
        <Preloader />
        
        {/* Navigation component stays at the top across all routes */}
        <Navigation />
        
        {/* Main wrapper takes up all remaining flex space, ensuring the footer is pushed down 
            if the page content is shorter than the screen. */}
        <main id="main-content" className="flex-1 flex flex-col">{children}</main>
        
        {/* Chatbot component */}
        <Chatbot />
        
        {/* Footer component sits at the bottom across all routes */}
        <Footer />
      </body>
    </html>
  );
}
