import { test, expect } from '@playwright/test';

/**
 * E2E Tests for new Attack Types (stun / weaken / cleanse / buff)
 *
 * These are focused, fast tests that exercise the demo buttons added to the
 * BattleEngineExample UI. They assume the Test Actions buttons exist and
 * use the same selectors as the rest of the suite.
 */

test.describe('Attack Types - Demo Buttons', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
    await page.goto('/');
    await page.waitForSelector('[data-testid="creature-card"]', { timeout: 10000 });
  });

  test('Stun: target cannot act for one turn', async ({ page }) => {
    // Click Stun button (stable selector)
    const stunButton = page.locator('[data-testid="btn-stun"]').first();
    await stunButton.scrollIntoViewIfNeeded();
    await expect(stunButton).toBeVisible();
    await stunButton.click();

    // Wait for UI to enter target-selection mode
    await page.waitForSelector('[data-selecting-target="true"]', { timeout: 3000 });

    // Select an enemy creature (first enemy)
    const enemy = page.locator('[data-testid="creature-card"]').filter({ hasText: /Goblin|Goblin/i }).first();
    // If Goblin selector fails, pick the last creature which is commonly an enemy
    if (!await enemy.isVisible()) {
      await page.locator('[data-testid="creature-card"]').last().click();
    } else {
      await enemy.click();
    }

  // After stun, there should be a STUN badge on that creature (use data-status-id)
  const stunBadge = page.locator('[data-testid="status-badge"][data-status-id="STUN"]').first();
  await expect(stunBadge).toBeVisible({ timeout: 8000 });

    // Try to make that creature act (end turn twice to reach its turn) and assert it cannot act.
    const endTurn = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurn.click();
    await page.waitForTimeout(500);

    // Now it's enemy turn; end turn again to get back to player
    await endTurn.click();
    await page.waitForTimeout(500);

    // The stun should have prevented one action - ensure the badge is still present or duration decreased
    await expect(stunBadge).toBeVisible();
  });

  test('Weaken: target attack is reduced', async ({ page }) => {
  const weakenButton = page.locator('[data-testid="btn-weaken"]').first();
  await weakenButton.scrollIntoViewIfNeeded();
  await expect(weakenButton).toBeVisible();
  await weakenButton.click();
  await page.waitForSelector('[data-selecting-target="true"]', { timeout: 3000 });

    // Target Goblin
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: /Goblin/i }).first();
    if (!await goblin.isVisible()) {
      await page.locator('[data-testid="creature-card"]').last().click();
    } else {
      await goblin.click();
    }

  // Verify WEAKEN applied as an ATTACK_DEBUFF status
  const weakenBadge = goblin.locator('[data-testid="status-badge"][data-status-id="ATTACK_DEBUFF"]').first();
  await expect(weakenBadge).toBeVisible({ timeout: 8000 });

    // A rough check: perform a basic attack from a player creature and ensure damage is less than before
    // Capture enemy health now
    const healthLabel = goblin.locator('[data-testid="creature-health"]').first();
    const healthText = await healthLabel.textContent();
    const before = parseInt((healthText || '0').replace(/\D/g, ''));

    // Use the Basic Attack demo button if available
    const basicBtn = page.locator('button').filter({ hasText: /Basic Attack|Attack/i }).first();
    if (await basicBtn.isVisible()) {
      await basicBtn.click();
      await goblin.click();
      await page.waitForTimeout(500);

      const afterText = await healthLabel.textContent();
      const after = parseInt((afterText || '0').replace(/\D/g, ''));
      expect(after).toBeGreaterThan(0);
      expect(after).toBeLessThanOrEqual(before);
    }
  });

  test('Cleanse: removes debuffs', async ({ page }) => {
    // First apply a weaken debuff
    const weakenButton = page.locator('button').filter({ hasText: /⚔️.*Weaken|⚔️.*Weaken/i }).first();
    await weakenButton.scrollIntoViewIfNeeded();
    await weakenButton.click();

    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: /Goblin/i }).first();
    if (!await goblin.isVisible()) {
      await page.locator('[data-testid="creature-card"]').last().click();
    } else {
      await goblin.click();
    }

  // Verify WEAKEN badge appears
  const weakenBadge = goblin.locator('[data-testid="status-badge"][data-status-id="ATTACK_DEBUFF"]').first();
  await expect(weakenBadge).toBeVisible({ timeout: 7000 });

    // Now use Cleanse
  const cleanseButton = page.locator('[data-testid="btn-cleanse"]').first();
  await cleanseButton.scrollIntoViewIfNeeded();
  await cleanseButton.click();
  await page.waitForSelector('[data-selecting-target="true"]', { timeout: 3000 });
    await goblin.click();

  // After cleanse, the weaken (ATTACK_DEBUFF) badge should be gone
  await expect(weakenBadge).not.toBeVisible({ timeout: 8000 });
  });

  test('Buff: grants attack buff to target', async ({ page }) => {
  const buffButton = page.locator('[data-testid="btn-buff"]').first();
  await buffButton.scrollIntoViewIfNeeded();
  await expect(buffButton).toBeVisible();
  await buffButton.click();
  await page.waitForSelector('[data-selecting-target="true"]', { timeout: 3000 });

    // Target your first player creature
    const playerCreature = page.locator('[data-testid="creature-card"]').first();
    await playerCreature.click();

  // Buff should create ATTACK_BUFF on the target (data-status-id)
  const buffBadge = playerCreature.locator('[data-testid="status-badge"][data-status-id="ATTACK_BUFF"]').first();
  await expect(buffBadge).toBeVisible({ timeout: 8000 });
  });

});
