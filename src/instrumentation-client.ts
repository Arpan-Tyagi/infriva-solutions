import posthog from 'posthog-js'

// Runs before hydration, so posthog is loaded before PostHogPageView sends the first $pageview.
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only', // Use 'always' if you want anonymous profiles
    capture_pageview: false, // We handle this manually in PostHogPageView to capture full SEO queries
    capture_pageleave: true,
  })
} else {
  console.warn(
    '[PostHog] NEXT_PUBLIC_POSTHOG_KEY was not set at build time. Browser analytics, pageviews and session recordings are disabled.'
  )
}
