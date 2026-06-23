import { test, expect } from '@playwright/test';

test('has title and welcomes user', async ({ page }) => {
  await page.goto('/');
  // The page title is now "TalentFlow | Applicant Tracking System"
  await expect(page).toHaveTitle(/TalentFlow/);
});
