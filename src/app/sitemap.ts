/**
 * @file src/app/sitemap.ts
 * @description Dynamic XML Sitemap Generator (Next.js Metadata Route)
 *
 * Next.js automatically executes this function at build time to generate `/sitemap.xml`.
 * It indexes all 41 public content URLs across marketing, services, case studies, blog articles, and legal documents.
 *
 * Search Engine Optimization (SEO) Architecture:
 * 1. Base URL Resolution:
 *    - Reads `process.env.NEXT_PUBLIC_SITE_URL` (e.g., `https://infrivasolutions.com`).
 * 2. Crawl Frequencies & Priority Weights:
 *    - Homepage (`/`): Priority 1.0, weekly change frequency.
 *    - Core Landing Pages (`/services`, `/contact`): Priority 0.9, monthly.
 *    - Service Detail Pages (`/services/[slug]`): Priority 0.8, monthly.
 *    - Thought Leadership Articles (`/blog/[slug]`): Priority 0.7, monthly.
 *    - Case Studies (`/projects/[slug]`): Priority 0.8, monthly.
 */

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { SERVICES_LIST } from '@/lib/services';
import { BLOG_POSTS_LIST } from '@/lib/blog';
import { PROJECTS_LIST } from '@/lib/projects';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: '', lastModified: '2026-10-31T00:00:00.000Z', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/services', lastModified: '2026-10-12T00:00:00.000Z', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/projects', lastModified: '2026-10-26T00:00:00.000Z', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/about', lastModified: '2026-10-12T00:00:00.000Z', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog', lastModified: '2026-10-31T00:00:00.000Z', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/contact', lastModified: '2026-10-12T00:00:00.000Z', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/terms', lastModified: '2026-10-01T00:00:00.000Z', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/privacy-policy', lastModified: '2026-10-01T00:00:00.000Z', changeFrequency: 'yearly', priority: 0.4 },
  ].map((item) => ({
    url: `${SITE_URL}${item.path}`,
    lastModified: new Date(item.lastModified),
    changeFrequency: item.changeFrequency as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: item.priority,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = SERVICES_LIST.map((service) => ({
    url: `${SITE_URL}/services/${service.slug}`,
    lastModified: new Date(service.lastModified),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS_LIST.map((post) => ({
    url: `${SITE_URL}/blog/${post.id}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const projectRoutes: MetadataRoute.Sitemap = PROJECTS_LIST.map((project) => ({
    url: `${SITE_URL}/projects/${project.id}`,
    lastModified: new Date(project.lastModified),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes, ...projectRoutes];
}
