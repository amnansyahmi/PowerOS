/** Keep email confirmation destinations local, including browser backslash
 * normalization and percent-encoded separators/control characters. */
export function safeRedirectPath(value: string | null): string {
  if (!value) return '/command';
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return '/command'; }
  if (!decoded.startsWith('/') || /^\/[\/\\]/.test(decoded) || /[\\\x00-\x1f\x7f]/.test(decoded)) return '/command';
  return value;
}
