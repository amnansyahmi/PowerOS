import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const port = process.env.BROWSER_SMOKE_PORT || '3110';
const base = `http://127.0.0.1:${port}`;
const guardBase = `http://127.0.0.1:${Number(port) + 1}`;
const start = (serverPort, preview) => spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(serverPort)], {
  env: { ...process.env, POWEROS_ALLOW_PUBLIC_PREVIEW: preview ? '1' : '0' }, stdio: 'pipe',
});
const servers = [start(port, true), start(Number(port) + 1, false)];
let browser;
async function ready(url) {
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Server unavailable: ${url}`);
}
try {
  await Promise.all([ready(base), ready(guardBase)]);
  // This check is intended for an unconfigured local auth environment.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const protectedPage = await fetch(`${guardBase}/people/employees`, { redirect: 'manual' });
    assert.equal(protectedPage.status, 307);
    assert.match(protectedPage.headers.get('location'), /\/login\?notice=setup_required/);
    assert.equal(protectedPage.headers.get('cache-control'), 'private, no-store');
    assert.equal((await fetch(`${guardBase}/onboarding`)).status, 200);
  }
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const manifest = await (await fetch(`${base}/manifest.webmanifest`)).json();
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.icons.length, 3);
  for (const icon of manifest.icons) assert.equal((await fetch(base + icon.src)).status, 200);

  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/command', '/people/employees', '/finance/invoices', '/crm/deals', '/account', '/login', '/']) {
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, route);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Document overflow: ${width} ${route}`);
      assert.match(await page.locator('meta[name=viewport]').getAttribute('content'), /user-scalable=no/);
      if (route.startsWith('/people') || route.startsWith('/finance') || route.startsWith('/crm') || route === '/command') {
        assert.equal(await page.getByRole('navigation', { name: 'Business apps' }).getByRole('link').count(), 6);
      }
    }
  }
  await page.goto(base + '/people/employees', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.getByRole('dialog', { name: 'Lekiu navigation' }).waitFor();
  await page.getByRole('button', { name: 'Close navigation', exact: true }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await page.evaluate(() => {
    const gesture = new Event('gesturestart', { cancelable: true });
    document.dispatchEvent(gesture); return gesture.defaultPrevented;
  }), true);

  await page.goto(base + '/command', { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  const cached = await page.evaluate(async () => (await Promise.all((await caches.keys()).map(async key => (await (await caches.open(key)).keys()).map(r => new URL(r.url).pathname)))).flat());
  assert(cached.includes('/offline.html'));
  assert(cached.every(path => path === '/offline.html' || path.startsWith('/pwa/')), 'Private response cached');
  await context.setOffline(true);
  await page.goto(base + '/command', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'You’re offline' }).waitFor();
  await context.setOffline(false);
  await page.getByRole('link', { name: 'Try again' }).click();
  await page.getByRole('navigation', { name: 'Business apps' }).waitFor();
  if (process.env.BROWSER_SCREENSHOT_DIR) {
    mkdirSync(process.env.BROWSER_SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: `${process.env.BROWSER_SCREENSHOT_DIR}/poweros-mobile.png` });
    await page.goto(base + '/finance/invoices', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${process.env.BROWSER_SCREENSHOT_DIR}/poweros-mobile-invoices.png` });
  }
  await page.getByRole('button', { name: 'Open account menu', exact: true }).click();
  await page.getByRole('button', { name: 'Install PowerOS', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.waitForURL('**/login');
  assert.deepEqual(errors, []);
  console.log('PASS: protected routes, mobile widths 320/390/430, drawers, zoom controls, manifest, icons, service worker, private-cache isolation, offline/reconnect.');
} finally {
  await browser?.close();
  for (const server of servers) server.kill('SIGTERM');
}
