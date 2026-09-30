/**
 * @file src/app/sitemap.ts
 * @description Dynamic XML Sitemap Generator (Next.js Metadata Route)
 *
 * Next.js automatically executes this function at build time to generate `/sitemap.xml`.
 * It indexes all 21 public content URLs across marketing, services, case studies, blog articles, and legal documents.
 *
 * Search Engine Optimization (SEO) Architecture:
 * 1. Base URL Resolution:
 *    - Reads `process.env.NEXT_PUBLIC_SITE_URL` (e.g., `https://infrivasolutions.com`).
 * 2. Crawl Frequencies & Priority Weights:
 *    - Homepage (`/`): Priority 1.0, weekly change frequency.
 *    - Core Landing Pages (`/services`, `/contact`): Priority 0.8, monthly.
 *    - Service Detail Pages (`/services/[slug]`): Priority 0.8, monthly.
 *    - Thought Leadership Articles (`/blog/[slug]`): Priority 0.7, monthly.
 *    - Case Studies (`/projects/[slug]`): Priority 0.7, monthly.
 */

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://infrivasolutions.com';
  const currentDate = new Date();

  // Core static site landing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/services',
    '/projects',
    '/about',
    '/blog',
    '/contact',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: (route === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Flagship Agency Services (7 Slugs)
  const serviceSlugs: MetadataRoute.Sitemap = [
    'premium-content',
    'social-media-management',
    'seo-and-geo',
    'retention-marketing',
    'web-development',
    'paid-advertising',
    'crm-systems',
  ].map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Thought Leadership Editorial Articles (4 Slugs)
  const blogSlugs: MetadataRoute.Sitemap = [
    'why-your-social-media-gets-attention-but-not-customers',
    'why-every-small-business-needs-crm-software',
    'why-your-website-is-not-getting-leads-and-how-to-fix-it',
    'seo-vs-google-ads-which-is-better-for-your-business',
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Portfolio Client Case Studies (2 Slugs)
  const projectSlugs: MetadataRoute.Sitemap = [
    'flyinglyte',
    'starx',
  ].map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Combine and return unified sitemap array
  return [...staticRoutes, ...serviceSlugs, ...blogSlugs, ...projectSlugs];
}
