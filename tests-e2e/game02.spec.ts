import { expect, type Page, test } from '@playwright/test';

async function runIn(page: Page, label: string, command: string) {
  const input = page.getByRole('textbox', { name: label });
  await input.fill(command);
  await input.press('Enter');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem(
      'robot-game:progress:v1',
      JSON.stringify({ completedGameIds: ['game-01'], introSeen: true }),
    );
  });
  await page.reload();
  await page.getByRole('button', { name: /Прошивка теплицы/ }).click();
  await page.getByRole('button', { name: 'Начать' }).click();
});

test('walks through editing, compiling, testing in the REPL, and flashing to completion', async ({ page }) => {
  await expect(page.locator('.controller-illustration')).toHaveAttribute('data-pose', 'broken');

  await page.getByRole('button', { name: 'Выключить насосы' }).click();
  await expect(page.locator('.controller-illustration')).toHaveAttribute('data-pose', 'quiet');

  const editor = page.getByRole('textbox', { name: 'Исходный код firmware.c' });
  await editor.fill('#define DRY_SOIL 40\n');

  await runIn(page, 'Терминал сборки', 'arm-none-eabi-gcc -mcpu=cortex-m3 -O2 firmware.c -o firmware.bin');

  await runIn(page, 'JS REPL', 'shouldWater(36, 21, 300)');
  await expect(page.getByText('true')).toBeVisible();

  await runIn(page, 'Терминал сборки', 'flash --target gh-ctrl firmware.bin');

  await expect(page.getByText(/проклюнулись/)).toBeVisible();
  await expect(page.locator('.controller-illustration')).toHaveAttribute('data-pose', 'fixed');

  await page.getByRole('button', { name: 'Продолжить' }).click();
  await expect(page.getByText('Помоги роботу')).toBeVisible();
  await expect(page.getByRole('button', { name: /Прошивка теплицы/ })).toContainText('✓');
});

test('refuses to compile without a target processor flag', async ({ page }) => {
  await runIn(page, 'Терминал сборки', 'arm-none-eabi-gcc -O2 firmware.c -o firmware.bin');
  await expect(page.getByText(/не указан целевой процессор/)).toBeVisible();
});

test('leaving the threshold unchanged flashes fine but does not fix the greenhouse', async ({ page }) => {
  await runIn(page, 'Терминал сборки', 'arm-none-eabi-gcc -mcpu=cortex-m3 -O2 firmware.c -o firmware.bin');
  await runIn(page, 'Терминал сборки', 'flash --target gh-ctrl firmware.bin');
  await expect(page.getByText('verify: ok')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Продолжить' })).not.toBeVisible();
});

test('sidebar man links open and close the command reference', async ({ page }) => {
  await page.getByRole('button', { name: 'man flash' }).click();
  const flashPage = page.getByRole('dialog', { name: /man flash/ });
  await expect(flashPage).toContainText('flash --target gh-ctrl firmware.bin');
  await page.getByRole('button', { name: 'Закрыть' }).click();
  await expect(flashPage).not.toBeVisible();

  await page.getByRole('button', { name: 'man arm-none-eabi-gcc' }).click();
  await expect(page.getByRole('dialog', { name: /man arm-none-eabi-gcc/ })).toContainText('-mcpu=cortex-m3');
});
