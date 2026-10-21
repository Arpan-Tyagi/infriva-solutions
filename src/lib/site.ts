/**
 * @file src/lib/site.ts
 * @description Canonical Site Configuration, NAP Entity Registry & Schema.org JSON-LD Builders
 *
 * Centralizes canonical URL resolution (`https://www.infrivasolutions.com`), verified
 * Name-Address-Phone (NAP) contact details, and strongly-typed Schema.org JSON-LD
 * structured data generators used across all 27 routes.
 */

const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.infrivasolutions.com").replace(/\/+$/, "");

/**
 * Canonical origin aligned with live production redirect (`https://www.infrivasolutions.com`).
 * Normalizes bare `https://infrivasolutions.com` to `https://www.infrivasolutions.com`.
 */
export const SITE_URL =
  rawSiteUrl === "https://infrivasolutions.com"
    ? "https://www.infrivasolutions.com"
    : rawSiteUrl;

export const SITE_NAME = "Infriva Solutions";

export const AGENCY_NAP = {
  name: "Infriva Solutions",
  legalName: "Infriva Solutions",
  foundingYear: 2021,
  tagline: "B2B Digital Systems, Custom CRM Architecture, Next.js Web Engineering & Full-Stack Growth",
  description:
    "Infriva Solutions engineers high-conversion Next.js websites, custom PostgreSQL CRMs, full-stack SEO & GEO, Meta/Google Ads, and WhatsApp API automation.",
  email: "info@infrivasolutions.com",
  phones: [
    { display: "+91 85058 85515", href: "tel:+918505885515", e164: "+91-85058-85515" },
    { display: "+91 87968 62021", href: "tel:+918796862021", e164: "+91-87968-62021" },
  ],
  address: {
    streetAddress: "Connaught Place",
    addressLocality: "New Delhi",
    locality: "New Delhi",
    addressRegion: "Delhi",
    region: "Delhi",
    postalCode: "110001",
    addressCountry: "IN",
    display: "New Delhi, Delhi NCR, India (Serving Global & Enterprise Clients)",
  },
  hours: "Monday – Saturday, 10:00 AM – 7:00 PM IST",
  socialLinks: [
    "https://x.com/infrivasolutions",
    "https://linkedin.com/company/infriva",
    "https://instagram.com/infrivasolutions",
    "https://medium.com/@infrivasolutions",
  ],
  founder: {
    name: "Shalini Bhadoria",
    jobTitle: "Founder & Managing Director",
  },
  ceo: {
    name: "Arpan Tyagi",
    jobTitle: "Chief Executive Officer (CEO)",
  },
  headOfSeo: {
    name: "Disha Rajput",
    jobTitle: "Head of SEO Strategy",
  },
} as const;

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildGlobalGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": `${SITE_URL}/#organization`,
        name: AGENCY_NAP.name,
        legalName: AGENCY_NAP.legalName,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.png`,
          width: 512,
          height: 512,
        },
        image: `${SITE_URL}/images/minimalist-office.jpg`,
        description:
          "Infriva Solutions is a B2B digital engineering and growth agency specializing in Next.js web development, custom CRM architecture, Full-Stack SEO & GEO, WhatsApp API retention automation, and performance marketing.",
        email: AGENCY_NAP.email,
        telephone: AGENCY_NAP.phones[0].display,
        contactPoint: AGENCY_NAP.phones.map((p) => ({
          "@type": "ContactPoint",
          telephone: p.display,
          email: AGENCY_NAP.email,
          contactType: "sales",
          areaServed: ["IN", "US", "GB", "AE", "SG"],
          availableLanguage: ["English", "Hindi"],
        })),
        address: {
          "@type": "PostalAddress",
          streetAddress: AGENCY_NAP.address.streetAddress,
          addressLocality: AGENCY_NAP.address.addressLocality,
          addressRegion: AGENCY_NAP.address.addressRegion,
          postalCode: AGENCY_NAP.address.postalCode,
          addressCountry: AGENCY_NAP.address.addressCountry,
        },
        priceRange: "₹20,000 - ₹90,000+",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "10:00",
            closes: "19:00",
          },
        ],
        founder: {
          "@type": "Person",
          name: AGENCY_NAP.founder.name,
          jobTitle: AGENCY_NAP.founder.jobTitle,
        },
        employee: [
          {
            "@type": "Person",
            name: AGENCY_NAP.ceo.name,
            jobTitle: AGENCY_NAP.ceo.jobTitle,
          },
          {
            "@type": "Person",
            name: AGENCY_NAP.headOfSeo.name,
            jobTitle: AGENCY_NAP.headOfSeo.jobTitle,
          },
        ],
        sameAs: [...AGENCY_NAP.socialLinks],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: AGENCY_NAP.name,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        inLanguage: "en-IN",
      },
    ],
  };
}

export function buildContactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${SITE_URL}/contact#contactpage`,
    url: `${SITE_URL}/contact`,
    name: "Contact Infriva Solutions | Book a Technical Architecture Consultation",
    description:
      "Initiate a custom web engineering, CRM architecture, Full-Stack SEO & GEO, or growth automation engagement with Infriva Solutions.",
    mainEntity: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}
