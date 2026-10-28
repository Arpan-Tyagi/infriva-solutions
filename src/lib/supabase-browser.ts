import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a browser-side Supabase client for Client Components.
 * Re-uses the singleton instance in the browser.
 */
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createBrowserSupabaseClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );
  }

  return clientInstance;
}
