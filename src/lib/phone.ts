/**
 * @file src/lib/phone.ts
 * @description Strict E.164 Phone Normalization & Validation Engine
 *
 * Enforces Infriva Solutions' standard for Indian mobile numbers:
 * Converts raw user inputs with leading zeros (098...), spaces, dashes, or +91
 * into strict 12-digit E.164 format: 91XXXXXXXXXX
 */

export interface PhoneNormalizationResult {
  isValid: boolean;
  e164: string;
  raw: string;
  error?: string;
}

/**
 * Normalizes any Indian domestic phone string into strict E.164 format (91XXXXXXXXXX).
 * Strips whitespace, parentheses, dashes, plus signs, zero-width characters, and domestic prefixes.
 */
export function normalizeIndianPhone(input: string | null | undefined): PhoneNormalizationResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      e164: '',
      raw: input || '',
      error: 'Phone number is empty or not a string',
    };
  }

  const raw = input.trim();
  // Strip all non-numeric characters
  let digits = raw.replace(/\D/g, '');

  // Handle international 0091 prefix (e.g. 00919876543210 -> 919876543210)
  if (digits.startsWith('0091') && digits.length === 14) {
    digits = digits.slice(2);
  }

  // Handle domestic trunk 0 followed by 91 (e.g., 0919876543210 -> 919876543210)
  if (digits.startsWith('091') && digits.length === 13) {
    digits = digits.slice(1);
  }

  // Handle +91 followed by trunk 0 (e.g., 9109876543210 -> 919876543210)
  if (digits.startsWith('910') && digits.length === 13) {
    digits = `91${digits.slice(3)}`;
  }

  // Handle standard domestic trunk 0 with 10-digit mobile (e.g., 09876543210 -> 9876543210)
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  // If 10 digits provided (standard Indian mobile e.g., 9876543210), prepend 91 country code
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  // If 12 digits provided and starts with 91 (e.g., 919876543210), verify valid mobile starting digit (6,7,8,9)
  const isValidFormat = /^91[6-9]\d{9}$/.test(digits);

  if (!isValidFormat) {
    return {
      isValid: false,
      e164: digits,
      raw,
      error: `Invalid Indian mobile number format. Expected 10 digits or 91XXXXXXXXXX starting with 6-9, got: ${digits}`,
    };
  }

  return {
    isValid: true,
    e164: digits,
    raw,
  };
}

/**
 * Validates whether an already-formatted string complies with strict E.164 for India.
 */
export function isValidE164(phone: string): boolean {
  return /^91[6-9]\d{9}$/.test(phone);
}
