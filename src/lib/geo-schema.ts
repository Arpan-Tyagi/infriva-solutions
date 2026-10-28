/**
 * @file src/lib/geo-schema.ts
 * @description Generative Engine Optimization (GEO) & Schema.org JSON-LD Graph Builder
 *
 * Constructs interconnected Schema.org @graph entities optimized for citation
 * extraction across Google AI Overviews, ChatGPT Search, and Perplexity.
 */

export interface GeoSchemaInput {
  title: string;
  description: string;
  slug: string;
  authorName?: string;
  publishDate: string;
  modifiedDate?: string;
  faqs?: Array<{ question: string; answer: string }>;
  keywords?: string[];
}

export function buildGeoEntityGraph({
  title,
  description,
  slug,
  authorName = 'Arpan Tyagi',
  publishDate,
  modifiedDate,
  faqs = [],
  keywords = [],
}: GeoSchemaInput) {
  const canonicalUrl = `https://www.infrivasolutions.com/blog/${slug}`;

  const graph: any[] = [
    // 1. Organization Entity (Anchor)
    {
      '@type': 'Organization',
      '@id': 'https://www.infrivasolutions.com/#organization',
      name: 'Infriva Solutions',
      url: 'https://www.infrivasolutions.com',
      logo: 'https://www.infrivasolutions.com/images/logo.png',
      sameAs: [
        'https://www.linkedin.com/company/infrivasolutions',
        'https://www.instagram.com/infrivasolutions',
        'https://x.com/infrivasolutions',
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'New Delhi',
        addressCountry: 'IN',
      },
    },

    // 2. Article Entity
    {
      '@type': 'Article',
      '@id': `${canonicalUrl}#article`,
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://www.infrivasolutions.com/#website',
        name: 'Infriva Solutions',
        url: 'https://www.infrivasolutions.com',
      },
      headline: title,
      description,
      inLanguage: 'en-US',
      mainEntityOfPage: canonicalUrl,
      datePublished: publishDate,
      dateModified: modifiedDate || publishDate,
      author: {
        '@type': 'Person',
        name: authorName,
        jobTitle: 'Founder & Managing Director',
        worksFor: {
          '@id': 'https://www.infrivasolutions.com/#organization',
        },
      },
      publisher: {
        '@id': 'https://www.infrivasolutions.com/#organization',
      },
      keywords: keywords.join(', '),
    },

    // 3. BreadcrumbList Entity
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.infrivasolutions.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Insights & Architecture',
          item: 'https://www.infrivasolutions.com/blog',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: title,
          item: canonicalUrl,
        },
      ],
    },
  ];

  // 4. FAQPage Entity (If FAQs present)
  if (faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
