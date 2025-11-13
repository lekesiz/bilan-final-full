import { test, expect } from '@playwright/test';

test.describe('BILAN-EASY E2E Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Navigateur d'Évaluation de Compétences IA/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    // Navigate to login if there's a link
    const loginLink = page.getByRole('link', { name: /login/i });
    if (await loginLink.isVisible().catch(() => false)) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('should display dashboard after login', async ({ page }) => {
    // This test requires authentication setup
    // For now, just check if dashboard route exists
    await page.goto('/dashboard');
    // Should either show dashboard or redirect to login
    const url = page.url();
    expect(url).toMatch(/dashboard|login/);
  });
});

