import { expect, test } from 'vitest';
import { safeRedirectPath } from '@/lib/auth/redirect-path';

test('allows local paths and queries', () => {
  expect(safeRedirectPath('/reset-password')).toBe('/reset-password');
  expect(safeRedirectPath('/account?tab=security')).toBe('/account?tab=security');
});
test.each([null, 'https://evil.example', '//evil.example', '/\\evil.example', '/%5cevil.example', '/%2fevil.example', '/\nevil.example', '/%0devil.example', '/%ZZ'])('rejects unsafe redirect %s', (value) => {
  expect(safeRedirectPath(value)).toBe('/command');
});
