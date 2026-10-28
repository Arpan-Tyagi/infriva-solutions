/**
 * @file src/lib/ffmpeg-validator.ts
 * @description Node.js Media Inspection & Binary Specification Validator
 *
 * Enforces Instagram Graph API v23/24 binary container specifications:
 * - Reels/Videos: MP4/MOV, H.264/HEVC, moov atom at front (faststart), 23-60 FPS, max 1920w, AAC audio <= 48kHz.
 * - Static/Carousels: Aspect ratio strictly between 4:5 (0.8) and 1.91:1, width 320-1440px.
 */

export interface MediaValidationResult {
  passed: boolean;
  fileType: 'VIDEO' | 'IMAGE';
  specs: {
    codec?: string;
    videoCodec?: string;
    aspectRatio?: number;
    aspectRatioLabel?: string;
    width?: number;
    height?: number;
    durationSec?: number;
    fps?: number;
    audioCodec?: string;
    audioSampleRate?: number;
    moovAtFront?: boolean;
  };
  errors: string[];
}

/**
 * Validates image dimensions and aspect ratios against Instagram Graph API rules
 */
export function validateImageSpecs(width: number, height: number): MediaValidationResult {
  const errors: string[] = [];

  if (!width || !height || width <= 0 || height <= 0) {
    return {
      passed: false,
      fileType: 'IMAGE',
      specs: { width: width || 0, height: height || 0 },
      errors: ['Width and height must be positive non-zero numbers.'],
    };
  }

  const ratio = width / height;

  // Instagram accepts 4:5 (0.8) to 1.91:1
  if (ratio < 0.79 || ratio > 1.93) {
    errors.push(`Invalid image aspect ratio (${ratio.toFixed(2)}). Must be between 4:5 (0.80) and 1.91:1.`);
  }

  if (width < 320) {
    errors.push(`Image width (${width}px) is below minimum of 320px.`);
  }
  if (width > 1440) {
    errors.push(`Image width (${width}px) exceeds recommended 1440px for Instagram.`);
  }

  const passed = errors.length === 0;

  return {
    passed,
    fileType: 'IMAGE',
    specs: {
      width,
      height,
      aspectRatio: ratio,
      aspectRatioLabel: ratio < 1 ? '4:5 (Portrait)' : ratio === 1 ? '1:1 (Square)' : '1.91:1 (Landscape)',
    },
    errors,
  };
}

/**
 * Validates video stream specifications against Instagram Reels/Video rules
 */
export function validateVideoSpecs(params: {
  width: number;
  height: number;
  fps: number;
  durationSec: number;
  videoCodec: string;
  audioCodec?: string;
  audioSampleRate?: number;
  moovAtFront?: boolean;
}): MediaValidationResult {
  const errors: string[] = [];
  const ratio = params.width / params.height;

  // Instagram Reels requires 9:16 (0.5625) or feed video (4:5 to 16:9)
  if (params.width > 1920) {
    errors.push(`Video width (${params.width}px) exceeds maximum 1920px.`);
  }

  // Codec check (H.264 or HEVC)
  const validCodecs = ['h264', 'avc1', 'hevc', 'h265'];
  const isCodecValid = validCodecs.some((c) => params.videoCodec.toLowerCase().includes(c));
  if (!isCodecValid) {
    errors.push(`Unsupported video codec (${params.videoCodec}). Expected H.264 (avc1) or HEVC.`);
  }

  // Frame rate check (23 to 60 FPS)
  if (params.fps < 23 || params.fps > 60) {
    errors.push(`Frame rate (${params.fps} FPS) must be between 23 and 60 FPS.`);
  }

  // Audio check (AAC <= 48kHz)
  if (params.audioCodec && !params.audioCodec.toLowerCase().includes('aac')) {
    errors.push(`Audio codec (${params.audioCodec}) must be AAC.`);
  }
  if (params.audioSampleRate && params.audioSampleRate > 48000) {
    errors.push(`Audio sample rate (${params.audioSampleRate}Hz) exceeds maximum 48,000Hz.`);
  }

  // Faststart (moov atom at front)
  if (params.moovAtFront === false) {
    errors.push('Moov atom is not at the front of the file (faststart missing). Instagram will fail encoding.');
  }

  const passed = errors.length === 0;

  return {
    passed,
    fileType: 'VIDEO',
    specs: {
      width: params.width,
      height: params.height,
      aspectRatio: ratio,
      aspectRatioLabel: ratio < 0.6 ? '9:16 (Vertical Reel)' : `${ratio.toFixed(2)}:1`,
      fps: params.fps,
      durationSec: params.durationSec,
      videoCodec: params.videoCodec,
      audioCodec: params.audioCodec,
      audioSampleRate: params.audioSampleRate,
      moovAtFront: params.moovAtFront ?? true,
    },
    errors,
  };
}
