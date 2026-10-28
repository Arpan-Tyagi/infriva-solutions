/**
 * @file src/lib/crypto-safe.ts
 * @description Constant-Time Cryptographic Comparison Utility
 *
 * Prevents timing attacks and eliminates RangeError exceptions on buffer length mismatches.
 */

import crypto from 'crypto';

/**
 * Constant-time comparison of two strings or buffers.
 * Safely returns false if lengths differ without throwing RangeError.
 */
export function safeTimingEqual(a: string | Buffer | null | undefined, b: string | Buffer | null | undefined): boolean {
  if (a == null || b == null) {
    return false;
  }

  const bufA = typeof a === 'string' ? Buffer.from(a, 'utf8') : a;
  const bufB = typeof b === 'string' ? Buffer.from(b, 'utf8') : b;

  if (bufA.length !== bufB.length) {
    // Perform dummy constant-time comparison against itself to prevent timing leaks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}
