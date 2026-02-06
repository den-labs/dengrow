/**
 * Screenshot Capture Script
 *
 * Captures screenshots of DenGrow pages for documentation.
 *
 * Usage:
 *   1. Start the web app: pnpm dev
 *   2. Run this script: pnpm screenshots
 */

import { chromium } from 'playwright';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'assets');

interface Screenshot {
  name: string;
  path: string;
  viewport: { width: number; height: number };
  waitFor?: string;
}

const screenshots: Screenshot[] = [
  {
    name: 'home',
    path: '/',
    viewport: { width: 1280, height: 800 },
  },
  {
    name: 'home-mobile',
    path: '/',
    viewport: { width: 390, height: 844 },
  },
  {
    name: 'impact-dashboard',
    path: '/impact',
    viewport: { width: 1280, height: 800 },
  },
  {
    name: 'my-plants',
    path: '/my-plants',
    viewport: { width: 1280, height: 800 },
  },
];

async function captureScreenshots() {
  console.log('🚀 Starting screenshot capture...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (const screenshot of screenshots) {
    const page = await context.newPage();
    await page.setViewportSize(screenshot.viewport);

    const url = `${BASE_URL}${screenshot.path}`;
    console.log(`📸 Capturing: ${screenshot.name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Viewport: ${screenshot.viewport.width}x${screenshot.viewport.height}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait a bit for any animations
      await page.waitForTimeout(1000);

      const outputPath = join(OUTPUT_DIR, `${screenshot.name}.png`);
      await page.screenshot({ path: outputPath, fullPage: false });

      console.log(`   ✅ Saved: ${outputPath}\n`);
    } catch (error) {
      console.error(`   ❌ Failed: ${error}\n`);
    }

    await page.close();
  }

  await browser.close();
  console.log('✨ Screenshot capture complete!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.error('❌ Web server not running!');
    console.error(`   Please start the app first: pnpm dev`);
    console.error(`   Then run this script again.\n`);
    process.exit(1);
  }

  await captureScreenshots();
}

main().catch(console.error);
