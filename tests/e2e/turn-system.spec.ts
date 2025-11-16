import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Turn System
 * 
 * Tests the complete turn-based combat flow including:
 * - Status effect application
 * - Status ticking on turn end
 * - Duration countdown
 * - Status expiration
 * - Turn counter updates
 */

test.describe('Turn System - Status Effects', () => {
  
  test.beforeEach(async ({ page }) => {
    // Capture ALL browser console logs (must be before navigation!)
    page.on('console', msg => {
      const text = msg.text();
      // Log EVERYTHING for debugging
      console.log(`[BROWSER] ${text}`);
    });
    
    // Navigate to the app
    await page.goto('/');
    
    // Wait for battle to be ready
    await page.waitForSelector('[data-testid="creature-card"]', { timeout: 10000 });
  });

  test('should apply burn status and show duration badge', async ({ page }) => {
    console.log('🧪 TEST: Apply burn status');

    // Find Goblin (enemy creature)
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    await expect(goblin).toBeVisible();

    // Get initial health
    const initialHealth = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Goblin initial health: ${initialHealth}`);

    // Click Burn button to start target selection (scroll into view if needed)
    const burnButton = page.locator('button').filter({ hasText: /🔥.*Burn/i }).first();
    await burnButton.scrollIntoViewIfNeeded();
    await expect(burnButton).toBeVisible();
    await burnButton.click();

    // Click Goblin as target
    await goblin.click();
    await page.waitForTimeout(1000);

    // Verify burn status appears
    const burnBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /🔥|burn/i });
    await expect(burnBadge).toBeVisible({ timeout: 5000 });

    // Verify duration is shown (should be 3 or similar)
    const burnText = await burnBadge.textContent();
    console.log(`🔥 Burn badge text: ${burnText}`);
    expect(burnText).toMatch(/[0-9]/); // Should contain a number

    // ✅ Two-phase pattern: Burn does NOT deal damage on initial application
    // Damage only applies on tick (at end of turn)
    const newHealth = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Goblin health after burn application: ${newHealth}`);
    expect(newHealth).toBe(initialHealth); // Health should be unchanged until turn end
  });

  test('should tick burn damage on turn end', async ({ page }) => {
    console.log('🧪 TEST: Burn ticks on turn end');
    
    // Apply burn (same as previous test)
    await applyBurnToGoblin(page);
    
    // Get health before turn end
    const healthBeforeTick = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health before turn end: ${healthBeforeTick}`);
    
    // Click End Turn button
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await expect(endTurnButton).toBeVisible();
    await endTurnButton.click();
    console.log('⏰ Waiting for burn effect to process...');
    await page.waitForTimeout(3000); // Increased wait time
    
    // Verify health decreased from burn tick
    const healthAfterTick = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health after turn end: ${healthAfterTick}`);
    expect(healthAfterTick).toBeLessThan(healthBeforeTick);
    
    const burnDamage = healthBeforeTick - healthAfterTick;
    console.log(`🔥 Burn damage dealt: ${burnDamage}`);
    expect(burnDamage).toBeGreaterThan(0);
    expect(burnDamage).toBeLessThanOrEqual(10); // Burn typically does ~5 damage
  });

  test('should decrement burn duration on turn end', async ({ page }) => {
    console.log('🧪 TEST: Burn duration decrements');
    
    // Apply burn
    await applyBurnToGoblin(page);
    
    // Get initial duration
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    const burnBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /🔥|burn/i });
    const initialDuration = await extractDuration(burnBadge);
    console.log(`⏱️ Initial duration: ${initialDuration}`);
    
    // End turn
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(3000);
    
    // Get new duration
    const newDuration = await extractDuration(burnBadge);
    console.log(`⏱️ New duration: ${newDuration}`);
    
    // Verify duration decreased by 1
    expect(newDuration).toBe(initialDuration - 1);
  });

  test('should remove burn when duration reaches 0', async ({ page }) => {
    console.log('🧪 TEST: Burn expires at duration 0');
    
    // Apply burn
    await applyBurnToGoblin(page);
    
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    const burnBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /🔥|burn/i });
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    
    // Get initial duration
    const initialDuration = await extractDuration(burnBadge);
    console.log(`⏱️ Burn will expire in ${initialDuration} turns`);
    
    // Click End Turn until burn expires
    for (let i = 0; i < initialDuration; i++) {
      console.log(`🔄 Turn ${i + 1}/${initialDuration}`);
      await endTurnButton.click();
      await page.waitForTimeout(3000);
    }
    
    // Verify burn badge is gone
    await expect(burnBadge).toBeHidden({ timeout: 2000 });
    console.log('✅ Burn status removed after expiration');
  });

  test('should increment turn counter on End Turn', async ({ page }) => {
    console.log('🧪 TEST: Turn counter increments');
    
    // Find turn counter
    const turnCounter = page.locator('[data-testid="turn-counter"]').or(
      page.locator('text=/Turn [0-9]+/i')
    ).first();
    
    // Get initial turn
    const initialTurnText = await turnCounter.textContent();
    const initialTurn = extractTurnNumber(initialTurnText || '');
    console.log(`🎯 Initial turn: ${initialTurn}`);
    
    // Click End Turn
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(1000);
    
    // Get new turn
    const newTurnText = await turnCounter.textContent();
    const newTurn = extractTurnNumber(newTurnText || '');
    console.log(`🎯 New turn: ${newTurn}`);
    
    // Verify turn incremented
    expect(newTurn).toBe(initialTurn + 1);
  });

  test('should switch turn owner on End Turn', async ({ page }) => {
    console.log('🧪 TEST: Turn owner switches');
    
    // Find turn owner indicator
    const turnOwner = page.locator('[data-testid="turn-owner"]').or(
      page.locator('text=/player|computer/i')
    ).first();
    
    // Get initial owner
    const initialOwner = await turnOwner.textContent();
    console.log(`👤 Initial owner: ${initialOwner}`);
    
    // Click End Turn
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(1000);
    
    // Get new owner
    const newOwner = await turnOwner.textContent();
    console.log(`👤 New owner: ${newOwner}`);
    
    // Verify owner switched
    expect(newOwner).not.toBe(initialOwner);
  });

  test('should handle burn status correctly across turns', async ({ page }) => {
    console.log('🧪 TEST: Burn status across multiple turns');
    
    // Apply burn to Goblin
    await applyBurnToGoblin(page);
    
    // Get health before turn
    const healthBefore = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health before turn: ${healthBefore}`);
    
    // End turn
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(3000);
    
    // Verify health changed (burn ticked)
    const healthAfter = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health after turn: ${healthAfter}`);
    expect(healthAfter).toBeLessThan(healthBefore);
    
    console.log('✅ Burn ticked correctly across turn');
  });

  test('should apply shield status and show duration badge', async ({ page }) => {
    console.log('🧪 TEST: Apply shield status');

    // Find Dragon (player creature - we want to shield our own creature)
    const dragon = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Dragon' }).first();
    await expect(dragon).toBeVisible();

    // Get initial health
    const initialHealth = await getCreatureHealth(page, 'Dragon');
    console.log(`📊 Dragon initial health: ${initialHealth}`);

    // Click Shield button to start target selection (scroll into view if needed)
    const shieldButton = page.locator('button').filter({ hasText: /🛡️.*Shield/i }).first();
    await shieldButton.scrollIntoViewIfNeeded();
    await expect(shieldButton).toBeVisible();
    await shieldButton.click();

    // Click Dragon as target
    await dragon.click();
    await page.waitForTimeout(1000);

    // Verify shield status appears
    const shieldBadge = dragon.locator('[data-testid="status-badge"]').filter({ hasText: /🛡️|shield/i });
    await expect(shieldBadge).toBeVisible({ timeout: 5000 });

    // Verify duration is shown (should be 3)
    const shieldText = await shieldBadge.textContent();
    console.log(`🛡️ Shield badge text: ${shieldText}`);
    expect(shieldText).toMatch(/[0-9]/); // Should contain a number

    // Shield does not affect health on application (it's passive absorption)
    const newHealth = await getCreatureHealth(page, 'Dragon');
    console.log(`📊 Dragon health after shield application: ${newHealth}`);
    expect(newHealth).toBe(initialHealth); // Health unchanged
  });

  test('should decrement shield duration on turn end', async ({ page }) => {
    console.log('🧪 TEST: Shield duration decrements');

    // Apply shield to Dragon
    const dragon = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Dragon' }).first();
    const shieldButton = page.locator('button').filter({ hasText: /🛡️.*Shield/i }).first();
    await shieldButton.scrollIntoViewIfNeeded();
    await shieldButton.click();
    await dragon.click();
    await page.waitForTimeout(1000);

    // Get shield badge and initial duration
    const shieldBadge = dragon.locator('[data-testid="status-badge"]').filter({ hasText: /🛡️|shield/i });
    await expect(shieldBadge).toBeVisible();
    const initialDuration = await extractDuration(shieldBadge);
    console.log(`🛡️ Initial shield duration: ${initialDuration}`);

    // End turn
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(3000);

    // Check if shield still exists (should be visible with duration - 1)
    const stillVisible = await shieldBadge.isVisible();
    if (stillVisible) {
      const newDuration = await extractDuration(shieldBadge);
      console.log(`🛡️ Shield duration after turn: ${newDuration}`);
      expect(newDuration).toBe(initialDuration - 1);
    } else {
      // Shield expired
      console.log('🛡️ Shield expired after turn');
      expect(initialDuration).toBe(1); // Only expired if it was 1
    }
  });
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Applies burn status to Goblin using the Burn test button
 */
async function applyBurnToGoblin(page: Page) {
  console.log('🔥 Applying burn to Goblin...');

  const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();

  // Click Burn button to start target selection (scroll into view if needed)
  const burnButton = page.locator('button').filter({ hasText: /🔥.*Burn/i }).first();
  await burnButton.scrollIntoViewIfNeeded();
  await burnButton.click();

  // Target Goblin
  await goblin.click();
  await page.waitForTimeout(3000);

  // Verify burn applied
  const burnBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /🔥|burn/i });
  await expect(burnBadge).toBeVisible({ timeout: 5000 });

  console.log('✅ Burn applied successfully');
}

/**
 * Extracts health value from a creature card
 */
async function getCreatureHealth(page: Page, creatureName: string): Promise<number> {
  const creature = page.locator('[data-testid="creature-card"]').filter({ hasText: creatureName }).first();
  
  // Try multiple selectors for health
  const healthText = await creature.locator('[data-testid="creature-health"]')
    .or(creature.locator('text=/[0-9]+\\/[0-9]+/'))
    .first()
    .textContent();
  
  if (!healthText) {
    throw new Error(`Could not find health for ${creatureName}`);
  }
  
  // Extract current health (e.g., "185/200" -> 185)
  const match = healthText.match(/(\d+)/);
  if (!match) {
    throw new Error(`Could not parse health: ${healthText}`);
  }
  
  return parseInt(match[1], 10);
}

/**
 * Extracts duration number from status badge text
 */
async function extractDuration(badge: any): Promise<number> {
  const text = await badge.textContent();
  if (!text) return 0;
  
  // Extract number from text like "🔥3" or "Burn (3)"
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Extracts turn number from turn counter text
 */
function extractTurnNumber(text: string): number {
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
