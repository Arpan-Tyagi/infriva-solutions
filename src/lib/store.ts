/**
 * @file src/lib/store.ts
 * @description Lightweight In-Memory Client State Store
 *
 * This module tracks global ephemeral client-side state across client navigation.
 *
 * Core Problem Solved:
 * - When a user visits the Infriva website for the first time, we display an introductory
 *   cinematic preloader (`Preloader.tsx`) and apply choreographed staggered reveal delays
 *   to the hero headline, subtitle, and primary call-to-action buttons.
 * - However, once the initial loading sequence has completed, navigating between internal
 *   pages (e.g., from `/about` back to `/`) should NOT re-trigger the 2.5-second preloader
 *   or impose lengthy animation delays. Re-triggering them creates user friction and animation fatigue.
 *
 * Mechanics:
 * - `isInitialLoad` defaults to `true` on initial page load (or full browser reload).
 * - After `Preloader.tsx` plays its sequence, it invokes `setInitialLoad(false)`.
 * - Subsequent component mounts read `isInitialLoad === false` to immediately skip or reduce motion delays.
 */

/**
 * Tracks whether the user is viewing the application during their initial page load session.
 * Defaults to `true` upon browser initialization.
 */
export let isInitialLoad = true;

/**
 * Updates the initial load status flag.
 * Typically invoked by `Preloader.tsx` once the initial branding animation completes.
 *
 * @param val - Boolean indicating whether initial load is active (usually `false` after mount)
 */
export const setInitialLoad = (val: boolean) => {
  isInitialLoad = val;
};
