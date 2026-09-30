/**
 * @file src/app/robots.ts
 * @description Dynamic Robots.txt Crawler Directives (Next.js Metadata Route)
 *
 * Next.js automatically executes this function to serve `/robots.txt`.
 * It provides crawl instructions to search engine bots (Googlebot, Bingbot, etc.).
 *
 * Directives:
 * - `allow: '/'`: Permits indexing across all marketing, service, and editorial pages.
 * - `disallow: ['/api/']`: Protects backend API endpoints (`/api/contact`, `/api/chat`, `/api/meta/webhook`)
 *   from unnecessary crawler consumption and indexing.
 * - `sitemap`: Directly informs search engines of the canonical XML sitemap location.
 */

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://infrivasolutions.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
