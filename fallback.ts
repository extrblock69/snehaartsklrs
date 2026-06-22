/**
 * Configuration file to control upload storage fallback behavior.
 * If set to `false`, uploads will throw an error immediately and fail if Supabase is unconfigured or if its Cloud upload fails.
 * If set to `true`, a standard local disk filesystem sync in `/uploads` will handle the request as a secondary backup.
 */
export const allowLocalFallback = false;
