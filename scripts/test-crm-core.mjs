import { normalizeIndianPhone } from '../src/lib/phone.ts';
import { extractAttributionFromParams } from '../src/lib/attribution.ts';
import { validateImageSpecs, validateVideoSpecs } from '../src/lib/ffmpeg-validator.ts';
import { buildGeoEntityGraph } from '../src/lib/geo-schema.ts';

function runTests() {
  console.log('🧪 Starting Infriva CRM Core Unit Verification Suite...\n');

  // Test 1: Phone Normalization (E.164 91XXXXXXXXXX)
  console.log('--- TEST 1: Phone Normalization ---');
  const phoneCases = [
    { input: '9876543210', expected: '919876543210', valid: true },
    { input: '09876543210', expected: '919876543210', valid: true },
    { input: '+91 98765 43210', expected: '919876543210', valid: true },
    { input: '91-98765-43210', expected: '919876543210', valid: true },
    { input: '12345', valid: false },
  ];

  for (const tc of phoneCases) {
    const res = normalizeIndianPhone(tc.input);
    if (tc.valid) {
      if (res.isValid && res.e164 === tc.expected) {
        console.log(`✅ Passed: "${tc.input}" -> "${res.e164}"`);
      } else {
        console.error(`❌ Failed: "${tc.input}" expected "${tc.expected}", got "${res.e164}"`);
        process.exit(1);
      }
    } else {
      if (!res.isValid) {
        console.log(`✅ Passed: "${tc.input}" correctly rejected as invalid`);
      } else {
        console.error(`❌ Failed: "${tc.input}" was expected to fail but passed`);
        process.exit(1);
      }
    }
  }

  // Test 2: Attribution Touch
  console.log('\n--- TEST 2: Attribution Touch Extraction ---');
  const params = new URLSearchParams('utm_source=meta&utm_medium=paid_social&utm_campaign=cbo_q4&gclid=test_gclid_123');
  const attr = extractAttributionFromParams(params);
  if (attr && attr.utm_source === 'meta' && attr.gclid === 'test_gclid_123') {
    console.log('✅ Passed: Atomic attribution touch correctly extracted with GCLID.');
  } else {
    console.error('❌ Failed: Attribution extraction failed:', attr);
    process.exit(1);
  }

  // Test 3: Media Specs (FFmpeg Validator)
  console.log('\n--- TEST 3: Media Binary Specs Validator ---');
  const validReel = validateVideoSpecs({
    width: 1080,
    height: 1920,
    fps: 30,
    durationSec: 30,
    videoCodec: 'h264',
    audioCodec: 'aac',
    audioSampleRate: 48000,
    moovAtFront: true,
  });
  if (validReel.passed) {
    console.log('✅ Passed: Valid 9:16 Reel specs passed validation.');
  } else {
    console.error('❌ Failed: Valid Reel was rejected:', validReel.errors);
    process.exit(1);
  }

  const badImage = validateImageSpecs(2500, 1000); // 2.5:1 ratio exceeds 1.91:1
  if (!badImage.passed) {
    console.log('✅ Passed: Image exceeding 1.91:1 ratio correctly rejected.');
  } else {
    console.error('❌ Failed: Bad image was expected to fail.');
    process.exit(1);
  }

  // Test 4: GEO Schema Graph
  console.log('\n--- TEST 4: Generative Engine Optimization (GEO) Graph ---');
  const geo = buildGeoEntityGraph({
    title: 'Direct Hotel Booking Engine Architecture',
    description: 'Next.js 16 and PostgreSQL architecture guide',
    slug: 'hotel-engine',
    publishDate: '2026-10-27T08:00:00Z',
    faqs: [{ question: 'What is the LCP target?', answer: 'Sub-1.5s' }],
  });

  const graphTypes = geo['@graph'].map((g) => g['@type']);
  if (graphTypes.includes('Organization') && graphTypes.includes('Article') && graphTypes.includes('BreadcrumbList') && graphTypes.includes('FAQPage')) {
    console.log('✅ Passed: Schema.org @graph contains Organization, Article, BreadcrumbList, and FAQPage.');
  } else {
    console.error('❌ Failed: Missing entity types in @graph:', graphTypes);
    process.exit(1);
  }

  console.log('\n✨ ALL CRM CORE UNIT TESTS PASSED WITH ZERO DEFECTS! ✨');
}

runTests();
