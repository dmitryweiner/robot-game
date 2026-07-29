import { expect, type Page, test } from '@playwright/test';

async function runCommand(page: Page, command: string) {
  const input = page.getByRole('textbox', { name: 'Командная строка' });
  await input.fill(command);
  await input.press('Enter');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Понятно' }).click();
  await page.getByRole('button', { name: /Ремонтная консоль/ }).click();
  await page.getByRole('button', { name: 'Начать' }).click();
});

test('walks through the whole repair puzzle to completion', async ({ page }) => {
  await expect(page.getByText('robot@northbridge:/ #')).toBeVisible();
  await expect(page.locator('.robot-illustration')).toHaveAttribute('data-pose', 'lying');

  await runCommand(page, 'ls drivers');
  await expect(page.getByText(/nb_init\.sh/)).toBeVisible();

  await runCommand(page, 'journalctl | tail -n 500 | grep ERROR');
  await expect(page.getByText(/permission denied/)).toBeVisible();

  await runCommand(page, 'ls -l drivers/nb_init.sh');
  await expect(page.getByText(/^-rw-r--r--/)).toBeVisible();

  await page.getByRole('button', { name: 'Показать подсказку' }).click();
  await expect(page.getByText('chmod +x drivers/nb_init.sh')).toBeVisible();

  await runCommand(page, 'chmod +x drivers/nb_init.sh');
  await expect(page.locator('.robot-illustration')).toHaveAttribute('data-pose', 'lifting');
  await runCommand(page, './drivers/nb_init.sh');

  await expect(page.getByText(/Северный мост поднят/)).toBeVisible();
  await expect(page.locator('.robot-illustration')).toHaveAttribute('data-pose', 'fixed');

  await page.getByRole('button', { name: 'Продолжить' }).click();
  await expect(page.getByText('Помоги роботу')).toBeVisible();
  await expect(page.getByRole('button', { name: /Ремонтная консоль/ })).toContainText('✓');
});

test('running the script before chmod is refused with permission denied', async ({ page }) => {
  await runCommand(page, './drivers/nb_init.sh');
  await expect(page.getByText('bash: ./drivers/nb_init.sh: Permission denied')).toBeVisible();
});

test('Tab completes the command and stays in the terminal instead of moving focus away', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Командная строка' });
  await input.fill('jour');
  await input.press('Tab');
  await expect(input).toHaveValue('journalctl ');
  await expect(input).toBeFocused();
});

test('sidebar man links open and close the command reference', async ({ page }) => {
  await page.getByRole('button', { name: 'man grep' }).click();
  const grepPage = page.getByRole('dialog', { name: /man grep/ });
  await expect(grepPage).toContainText('grep текст [файл]');
  await page.getByRole('button', { name: 'Закрыть' }).click();
  await expect(grepPage).not.toBeVisible();

  await page.getByRole('button', { name: 'man |' }).click();
  await expect(page.getByRole('dialog', { name: /man \|/ })).toContainText('команда1 | команда2');
});
