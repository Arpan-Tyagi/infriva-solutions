/**
 * @file src/app/api/revalidate-blog/route.ts
 * @description Next.js 16 Edge On-Demand ISR Revalidation Route
 *
 * Revalidates static paths instantly upon blog publication from CRM.
 */

import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { safeTimingEqual } from '@/lib/crypto-safe';

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || 'infriva_edge_revalidate_2026';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (!safeTimingEqual(secret, REVALIDATION_SECRET)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid revalidation secret' }, { status: 401 });
    }

    const body = await request.json();
    const slug = body.slug;

    // Strict slug validation against directory traversal and malicious characters
    if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid or missing slug format. Must be lowercase alphanumeric hyphens.' }, { status: 400 });
    }

    // Revalidate individual article path and blog directory listing
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/blog');
    revalidateTag('blog-index', 'default' as any);

    return NextResponse.json({
      revalidated: true,
      slug,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Revalidation error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
