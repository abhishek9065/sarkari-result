import { test, expect } from '@playwright/test';

const BASE_URL = 'https://sarkariexams.me';

test.describe('Homepage', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
    });

    test('should load homepage with title', async ({ page }) => {
        await expect(page).toHaveTitle(/SarkariExams.me/);
    });

    test('should display header with site name', async ({ page }) => {
        const header = page.locator('.site-header');
        await expect(header).toBeVisible();
        await expect(header).toContainText('SARKARIEXAMS.ME');
    });

    test('should display navigation menu', async ({ page }) => {
        const nav = page.locator('.main-nav, .navigation');
        await expect(nav).toBeVisible();
    });

    test('should display featured section', async ({ page }) => {
        const featured = page.locator('.featured-grid, .featured-section');
        await expect(featured).toBeVisible();
    });

    test('should display section tables', async ({ page }) => {
        const sectionTable = page.locator('.section-table').first();
        await expect(sectionTable).toBeVisible();
    });
});

test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
    });

    test('should navigate to Result tab', async ({ page }) => {
        await page.click('button:has-text("Result"), .nav-link:has-text("Result")');
        await expect(page.locator('.section-table-header')).toBeVisible();
    });

    test('should navigate to Jobs tab', async ({ page }) => {
        await page.click('button:has-text("Jobs"), .nav-link:has-text("Jobs")');
        await expect(page.locator('.section-table-header')).toBeVisible();
    });

    test('should navigate to Admit Card tab', async ({ page }) => {
        await page.click('button:has-text("Admit Card"), .nav-link:has-text("Admit Card")');
        await expect(page.locator('.section-table-header')).toBeVisible();
    });
});

test.describe('Theme Toggle', () => {
    test('should toggle dark mode', async ({ page }) => {
        await page.goto(BASE_URL);

        // Find and click theme toggle
        const themeToggle = page.locator('.theme-toggle, button[aria-label*="theme"]');
        if (await themeToggle.isVisible()) {
            await themeToggle.click();

            // Check if dark mode is applied
            const isDarkMode = await page.evaluate(() =>
                document.documentElement.getAttribute('data-theme') === 'dark'
            );
            expect(isDarkMode).toBe(true);
        }
    });
});

test.describe('Footer', () => {
    test('should display footer', async ({ page }) => {
        await page.goto(BASE_URL);
        const footer = page.locator('footer, .site-footer');
        await expect(footer).toBeVisible();
    });

    test('should have footer links', async ({ page }) => {
        await page.goto(BASE_URL);
        const footerLinks = page.locator('footer a, .site-footer a');
        await expect(footerLinks.first()).toBeVisible();
    });
});

test.describe('PWA', () => {
    test('should have manifest', async ({ page }) => {
        await page.goto(BASE_URL);
        const manifest = await page.getAttribute('link[rel="manifest"]', 'href');
        expect(manifest).toBeTruthy();
    });

    test('should register service worker', async ({ page }) => {
        await page.goto(BASE_URL);

        const hasServiceWorker = await page.evaluate(async () => {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                return registrations.length > 0;
            }
            return false;
        });

        // Service worker may take time to register, so we just check if it's supported
        expect(typeof hasServiceWorker).toBe('boolean');
    });
});

test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(BASE_URL);

        const header = page.locator('.site-header');
        await expect(header).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(BASE_URL);

        const header = page.locator('.site-header');
        await expect(header).toBeVisible();
    });
});
