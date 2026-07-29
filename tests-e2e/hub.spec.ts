import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('shows the global intro on first visit, then the hub with chapter 1 unlocked', async ({ page }) => {
  const globalIntro = page.getByRole('dialog', { name: 'Введение' });
  await expect(globalIntro).toBeVisible();

  const bookLink = globalIntro.getByRole('link', { name: /книгу/i });
  await expect(bookLink).toHaveAttribute('href', 'https://dmitryweiner.github.io/robot-talks/');

  await page.getByRole('button', { name: 'Понятно' }).click();
  await expect(globalIntro).not.toBeVisible();

  await expect(page.getByText('Помоги роботу')).toBeVisible();
  const chapter1 = page.getByRole('button', { name: /Ремонтная консоль/ });
  await expect(chapter1).toBeVisible();
  await expect(chapter1).toBeEnabled();
});

test('does not show the global intro again after it was dismissed', async ({ page }) => {
  await page.getByRole('button', { name: 'Понятно' }).click();
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Введение' })).not.toBeVisible();
});

test('reopens the global intro from the "Введение" button', async ({ page }) => {
  await page.getByRole('button', { name: 'Понятно' }).click();
  await page.getByRole('button', { name: 'Введение' }).click();
  await expect(page.getByRole('dialog', { name: 'Введение' })).toBeVisible();
});

test('hub matches its visual baseline', async ({ page }) => {
  await page.getByRole('button', { name: 'Понятно' }).click();
  await expect(page).toHaveScreenshot('hub.png');
});

test('navigates into the game and back', async ({ page }) => {
  await page.getByRole('button', { name: 'Понятно' }).click();

  await page.getByRole('button', { name: /Ремонтная консоль/ }).click();
  const chapterIntro = page.getByRole('dialog', { name: /Ремонтная консоль/ });
  await expect(chapterIntro).toContainText('северного моста');

  await page.getByRole('button', { name: 'Начать' }).click();
  await expect(page.getByRole('textbox', { name: 'Командная строка' })).toBeVisible();

  await page.getByRole('button', { name: '← В меню' }).click();
  await expect(page.getByText('Помоги роботу')).toBeVisible();
});
