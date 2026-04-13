/**
 * apiConfig.js
 * 
 * Centralised API base URL configuration.
 * 
 * - In development (Vite dev server):  uses the Vite proxy at /proxy
 *   The Vite server forwards /proxy/* → https://api.neodalsi.com/*  (bypasses CORS in dev)
 * 
 * - In production (Firebase Hosting / neodalsi.com):  uses the Firebase Cloud Function proxy
 *   The Cloud Function apiProxy forwards requests to api.neodalsi.com server-side (bypasses CORS in prod)
 */

const FIREBASE_PROJECT = 'innate-temple-337717';
const FIREBASE_REGION = 'us-central1';

// Cloud Function proxy base URL (production)
const CLOUD_FUNCTION_PROXY = `https://${FIREBASE_REGION}-${FIREBASE_PROJECT}.cloudfunctions.net/apiProxy`;

// Vite dev proxy base URL (development)
const VITE_DEV_PROXY = '/proxy';

/**
 * Returns the correct API base URL depending on the environment.
 * import.meta.env.DEV is true when running `pnpm dev`, false after `pnpm build`.
 */
export const API_BASE = import.meta.env.DEV ? VITE_DEV_PROXY : CLOUD_FUNCTION_PROXY;

export default API_BASE;
