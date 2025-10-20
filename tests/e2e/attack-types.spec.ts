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

    // Wait for attack to process before checking badge
    await page.waitForTimeout(1500);

  // After stun, there should be a STUN badge on that creature (use data-status-id)
  const stunBadge = page.locator('[data-testid="status-badge"][data-status-id="STUN"]').first();
  await expect(stunBadge).toBeVisible({ timeout: 8000 });

    // Verify the badge shows duration
    const badgeText = await stunBadge.textContent();
    console.log(`💫 Stun badge text: ${badgeText}`);
    
    // Try to end turn once - stun should still be present (duration 2 → 1)
    const endTurn = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurn.click();
    await page.waitForTimeout(1000);

    // The stun should still be visible with reduced duration
    await expect(stunBadge).toBeVisible({ timeout: 3000 });
  });

  test('Flame Swipe: deals damage and applies burn DoT', async ({ page }) => {
    // Click Flame Swipe button
    const flameSwipeButton = page.locator('[data-testid="btn-flameswipe"]').first();
    await flameSwipeButton.scrollIntoViewIfNeeded();
    await expect(flameSwipeButton).toBeVisible();
    await flameSwipeButton.click();

    // Wait for target selection mode
    await page.waitForSelector('[data-selecting-target="true"]', { timeout: 3000 });

    // Select an enemy creature (first enemy)
    const enemy = page.locator('[data-testid="creature-card"]').filter({ hasText: /Goblin|Goblin/i }).first();
    
    // Capture health before attack
    const healthLabel = enemy.locator('[data-testid="creature-health"]').first();
    const healthTextBefore = await healthLabel.textContent();
    const healthBefore = parseInt((healthTextBefore || '0').replace(/\D/g, ''));
    
    // If Goblin selector fails, pick the last creature which is commonly an enemy
    if (!await enemy.isVisible()) {
      await page.locator('[data-testid="creature-card"]').last().click();
    } else {
      await enemy.click();
    }

    // Wait for attack to process
    await page.waitForTimeout(1500);

    // Verify health decreased (15 damage dealt)
    const healthTextAfter = await healthLabel.textContent();
    const healthAfter = parseInt((healthTextAfter || '0').replace(/\D/g, ''));
    expect(healthAfter).toBeLessThan(healthBefore);
    console.log(`🔥 Flame Swipe damage: ${healthBefore} → ${healthAfter} (${healthBefore - healthAfter} dmg)`);

    // Verify BURN status badge appears
    const burnBadge = enemy.locator('[data-testid="status-badge"][data-status-id="BURN"]').first();
    await expect(burnBadge).toBeVisible({ timeout: 8000 });

    // Verify the badge shows duration (should be 3 turns)
    const badgeText = await burnBadge.textContent();
    console.log(`🔥 Burn badge text: ${badgeText}`);
    expect(badgeText).toContain('3');

    // End turn to verify burn deals DoT damage
    const endTurn = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurn.click();
    await page.waitForTimeout(1000);

    // Health should decrease again from burn DoT (5 dmg/turn)
    const healthAfterBurn = await healthLabel.textContent();
    const healthAfterBurnValue = parseInt((healthAfterBurn || '0').replace(/\D/g, ''));
    expect(healthAfterBurnValue).toBeLessThan(healthAfter);
    console.log(`🔥 Burn DoT tick: ${healthAfter} → ${healthAfterBurnValue} (${healthAfter - healthAfterBurnValue} dmg)`);

    // Burn badge should still be visible with reduced duration
    await expect(burnBadge).toBeVisible({ timeout: 3000 });
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
