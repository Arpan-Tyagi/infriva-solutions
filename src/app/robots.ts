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
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/login', '/portal/'],
      },
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt'],
        disallow: ['/api/', '/dashboard/', '/login', '/portal/'],
      },
    ],
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
