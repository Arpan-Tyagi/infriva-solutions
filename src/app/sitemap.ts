import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://infrivasolutions.com';
  const currentDate = new Date();

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

  const projectSlugs: MetadataRoute.Sitemap = [
    'flyinglyte',
    'starx',
  ].map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceSlugs, ...blogSlugs, ...projectSlugs];
}
