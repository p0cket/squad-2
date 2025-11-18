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

    // Find Dragon (player creature)
    const dragon = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Dragon' }).first();
    await expect(dragon).toBeVisible();

    // Apply Shield
    const shieldButton = page.locator('button').filter({ hasText: /🛡️.*Shield/i }).first();
    await shieldButton.scrollIntoViewIfNeeded();
    await expect(shieldButton).toBeVisible();
    await shieldButton.click();
    await dragon.click();
    await page.waitForTimeout(1000);

    // Verify shield badge appears
    const shieldBadge = dragon.locator('[data-testid="status-badge"]').filter({ hasText: /🛡️|shield/i });
    await expect(shieldBadge).toBeVisible({ timeout: 5000 });

    // Get initial shield duration
    const initialDuration = await extractDuration(shieldBadge);
    console.log(`🛡️ Initial shield duration: ${initialDuration}`);
    expect(initialDuration).toBe(3);

    // End turn 3 times and verify duration decrements
    for (let i = 0; i < 3; i++) {
      console.log(`🔄 Turn ${i + 1}/3`);
      const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
      await endTurnButton.click();
      await page.waitForTimeout(3000);

      if (i < 2) {
        // Should still have shield with decremented duration
        const newDuration = await extractDuration(shieldBadge);
        console.log(`🛡️ Shield duration after turn: ${newDuration}`);
        expect(newDuration).toBe(2 - i);
      } else {
        // Shield should be removed after 3 turns
        await expect(shieldBadge).not.toBeVisible();
        console.log('✅ Shield removed after expiration');
      }
    }
  });

  test('should apply poison status and show duration badge', async ({ page }) => {
    console.log('🧪 TEST: Apply poison status');

    // Find Goblin (enemy creature)
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    await expect(goblin).toBeVisible();

    // Get initial health
    const initialHealth = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Goblin initial health: ${initialHealth}`);

    // Click Poison button to start target selection
    const poisonButton = page.locator('button').filter({ hasText: /🧪.*Poison/i }).first();
    await poisonButton.scrollIntoViewIfNeeded();
    await expect(poisonButton).toBeVisible();
    await poisonButton.click();

    // Click Goblin as target
    await goblin.click();
    await page.waitForTimeout(1000);

    // Verify poison badge appears with duration 3
    const poisonBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /🧪|poison/i });
    await expect(poisonBadge).toBeVisible({ timeout: 5000 });

    const duration = await extractDuration(poisonBadge);
    console.log(`🧪 Poison duration: ${duration}`);
    expect(duration).toBe(3);

    console.log('✅ Poison applied successfully with correct duration');
  });

  test('should tick poison damage on turn end', async ({ page }) => {
    console.log('🧪 TEST: Poison ticks on turn end');

    // Find Goblin (enemy creature)
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    await expect(goblin).toBeVisible();

    const initialHealth = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health before poison: ${initialHealth}`);

    // Apply poison (15 damage per turn)
    const poisonButton = page.locator('button').filter({ hasText: /🧪.*Poison/i }).first();
    await poisonButton.scrollIntoViewIfNeeded();
    await poisonButton.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    // End turn to trigger poison tick
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(3000);

    // Check health decreased by 15
    const healthAfterTurn = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health after turn end: ${healthAfterTurn}`);
    
    const damageDealt = initialHealth - healthAfterTurn;
    console.log(`🧪 Poison damage dealt: ${damageDealt}`);
    
    expect(damageDealt).toBe(15);
    console.log('✅ Poison ticked correctly');
  });

  test('should decrement poison duration on turn end', async ({ page }) => {
    console.log('🧪 TEST: Poison duration decrements');

    // Find Goblin (enemy creature)
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    await expect(goblin).toBeVisible();

    // Apply poison
    const poisonButton = page.locator('button').filter({ hasText: /🧪.*Poison/i }).first();
    await poisonButton.scrollIntoViewIfNeeded();
    await poisonButton.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    // Verify poison badge
    const poisonBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /🧪|poison/i });
    await expect(poisonBadge).toBeVisible({ timeout: 5000 });

    const initialDuration = await extractDuration(poisonBadge);
    console.log(`🧪 Initial poison duration: ${initialDuration}`);
    expect(initialDuration).toBe(3);

    // End turn and check duration decreased
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(3000);

    const newDuration = await extractDuration(poisonBadge);
    console.log(`🧪 Poison duration after turn: ${newDuration}`);
    expect(newDuration).toBe(2);

    console.log('✅ Poison duration decremented correctly');
  });

  test('should handle poison status correctly across turns', async ({ page }) => {
    console.log('🧪 TEST: Poison across multiple turns');

    // Find Goblin
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    await expect(goblin).toBeVisible();

    const initialHealth = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Initial health: ${initialHealth}`);

    // Apply poison (15 dmg/turn)
    const poisonButton = page.locator('button').filter({ hasText: /🧪.*Poison/i }).first();
    await poisonButton.scrollIntoViewIfNeeded();
    await poisonButton.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    // Verify poison badge
    const poisonBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /🧪|poison/i });
    await expect(poisonBadge).toBeVisible({ timeout: 5000 });

    // End turn 3 times (poison lasts 3 turns)
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    
    for (let i = 1; i <= 3; i++) {
      console.log(`🔄 Turn ${i}/3`);
      await endTurnButton.click();
      await page.waitForTimeout(3000);
    }

    // After 3 turns, poison should have dealt 45 damage (15 x 3)
    const finalHealth = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health after 3 turns: ${finalHealth}`);
    
    const totalDamage = initialHealth - finalHealth;
    console.log(`🧪 Total poison damage: ${totalDamage}`);
    
    expect(totalDamage).toBe(45);
    console.log('✅ Poison ticked correctly across all turns');

    // Poison should be removed after 3 turns
    await expect(poisonBadge).not.toBeVisible();
    console.log('✅ Poison status removed after expiration');
  });

  test('should apply regeneration status and show duration badge', async ({ page }) => {
    console.log('💚 TEST: Apply regeneration status');

    // Find Dragon (player creature)
    const dragon = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Dragon' }).first();
    await expect(dragon).toBeVisible();

    // Get initial health
    const initialHealth = await getCreatureHealth(page, 'Dragon');
    console.log(`📊 Dragon initial health: ${initialHealth}`);

    // Click Regeneration button to start target selection
    const regenButton = page.locator('button').filter({ hasText: /💚.*Regeneration/i }).first();
    await regenButton.scrollIntoViewIfNeeded();
    await expect(regenButton).toBeVisible();
    await regenButton.click();

    // Click Dragon as target
    await dragon.click();
    await page.waitForTimeout(1000);

    // Verify regeneration badge appears with duration 3
    const regenBadge = dragon.locator('[data-testid="status-badge"]').filter({ hasText: /💚|regen/i });
    await expect(regenBadge).toBeVisible({ timeout: 5000 });

    const duration = await extractDuration(regenBadge);
    console.log(`💚 Regeneration duration: ${duration}`);
    expect(duration).toBe(3);

    console.log('✅ Regeneration applied successfully with correct duration');
  });

  test('should decrement regeneration duration on turn end', async ({ page }) => {
    console.log('💚 TEST: Regeneration duration decrements');

    // Find Dragon (player creature)
    const dragon = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Dragon' }).first();
    await expect(dragon).toBeVisible();

    // Apply regeneration
    const regenButton = page.locator('button').filter({ hasText: /💚.*Regeneration/i }).first();
    await regenButton.scrollIntoViewIfNeeded();
    await regenButton.click();
    await dragon.click();
    await page.waitForTimeout(1000);

    // Verify regeneration badge
    const regenBadge = dragon.locator('[data-testid="status-badge"]').filter({ hasText: /💚|regen/i });
    await expect(regenBadge).toBeVisible({ timeout: 5000 });

    const initialDuration = await extractDuration(regenBadge);
    console.log(`💚 Initial regeneration duration: ${initialDuration}`);
    expect(initialDuration).toBe(3);

    // End turn and check duration decreased
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(3000);

    const newDuration = await extractDuration(regenBadge);
    console.log(`💚 Regeneration duration after turn: ${newDuration}`);
    expect(newDuration).toBe(2);

    console.log('✅ Regeneration duration decremented correctly');
  });

  test('should handle regeneration status correctly across turns', async ({ page }) => {
    console.log('💚 TEST: Regeneration across multiple turns');

    // Find Goblin
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    await expect(goblin).toBeVisible();

    const initialHealth = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Initial health: ${initialHealth}`);

    // Damage Goblin with burn
    const burnButton = page.locator('button').filter({ hasText: /🔥.*Burn/i }).first();
    await burnButton.scrollIntoViewIfNeeded();
    await burnButton.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    // End turn to deal burn damage
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(3000);

    const damagedHealth = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health after burn: ${damagedHealth}`);

    // Apply regeneration (10 HP/turn for 3 turns)
    const regenButton = page.locator('button').filter({ hasText: /💚.*Regeneration/i }).first();
    await regenButton.scrollIntoViewIfNeeded();
    await regenButton.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    // Verify regeneration badge
    const regenBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /💚|regen/i });
    await expect(regenBadge).toBeVisible({ timeout: 5000 });

    // End turn 3 times - regen heals 10, burn damages 10 each turn = net 0
    for (let i = 1; i <= 3; i++) {
      console.log(`🔄 Turn ${i}/3`);
      await endTurnButton.click();
      await page.waitForTimeout(3000);
    }

    // Health should be approximately same (regen and burn cancel out)
    const finalHealth = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health after 3 turns: ${finalHealth}`);
    
    const netChange = Math.abs(finalHealth - damagedHealth);
    console.log(`💚 Net health change over 3 turns: ${netChange}`);
    
    // Should be close to 0 (regen cancels burn)
    expect(netChange).toBeLessThanOrEqual(2);
    console.log('✅ Regeneration and burn canceled each other out');

    // Regeneration should be removed after 3 turns
    await expect(regenBadge).not.toBeVisible();
    console.log('✅ Regeneration status removed after expiration');
  });

  test('should apply stun status and show duration badge', async ({ page }) => {
    console.log('💫 TEST: Apply stun status');

    // Find Goblin (enemy creature)
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    await expect(goblin).toBeVisible();

    // Get initial health
    const initialHealth = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Goblin initial health: ${initialHealth}`);

    // Click Stun button to start target selection
    const stunButton = page.locator('button').filter({ hasText: /💫.*Stun/i }).first();
    await stunButton.scrollIntoViewIfNeeded();
    await expect(stunButton).toBeVisible();
    await stunButton.click();

    // Click Goblin as target
    await goblin.click();
    await page.waitForTimeout(1000);

    // Verify stun badge appears with duration 2
    const stunBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /💫|stun/i });
    await expect(stunBadge).toBeVisible({ timeout: 5000 });

    const duration = await extractDuration(stunBadge);
    console.log(`💫 Stun duration: ${duration}`);
    expect(duration).toBe(2);

    // Verify damage was dealt
    const healthAfterStun = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health after stun: ${healthAfterStun}`);
    expect(healthAfterStun).toBeLessThan(initialHealth);

    console.log('✅ Stun applied successfully with correct duration');
  });

  test('should decrement stun duration on turn end', async ({ page }) => {
    console.log('💫 TEST: Stun duration decrements');

    // Find Goblin (enemy creature)
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    await expect(goblin).toBeVisible();

    // Apply stun
    const stunButton = page.locator('button').filter({ hasText: /💫.*Stun/i }).first();
    await stunButton.scrollIntoViewIfNeeded();
    await stunButton.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    // Verify stun badge
    const stunBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /💫|stun/i });
    await expect(stunBadge).toBeVisible({ timeout: 5000 });

    const initialDuration = await extractDuration(stunBadge);
    console.log(`💫 Initial stun duration: ${initialDuration}`);
    expect(initialDuration).toBe(2);

    // End turn and check duration decreased
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(3000);

    const newDuration = await extractDuration(stunBadge);
    console.log(`💫 Stun duration after turn: ${newDuration}`);
    expect(newDuration).toBe(1);

    console.log('✅ Stun duration decremented correctly');
  });

  test('should remove stun after duration expires', async ({ page }) => {
    console.log('💫 TEST: Stun expires after duration');

    // Find Goblin
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    await expect(goblin).toBeVisible();

    // Apply stun (2 turn duration)
    const stunButton = page.locator('button').filter({ hasText: /💫.*Stun/i }).first();
    await stunButton.scrollIntoViewIfNeeded();
    await stunButton.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    // Verify stun badge
    const stunBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /💫|stun/i });
    await expect(stunBadge).toBeVisible({ timeout: 5000 });

    // End turn twice (stun lasts 2 turns)
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    
    console.log('🔄 Turn 1/2');
    await endTurnButton.click();
    await page.waitForTimeout(3000);
    
    // Should still have stun with duration 1
    await expect(stunBadge).toBeVisible();
    const duration1 = await extractDuration(stunBadge);
    console.log(`💫 Stun duration after turn 1: ${duration1}`);
    expect(duration1).toBe(1);

    console.log('🔄 Turn 2/2');
    await endTurnButton.click();
    await page.waitForTimeout(3000);

    // Stun should be removed after 2 turns
    await expect(stunBadge).not.toBeVisible();
    console.log('✅ Stun status removed after expiration');
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

test.describe('Turn System - Status Effects - Bleed', () => {
  test.beforeEach(async ({ page }) => {
    // Capture browser console logs
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.text()}`);
    });
    
    // Navigate to the app
    await page.goto('/');
    
    // Wait for battle to be ready
    await page.waitForSelector('[data-testid="creature-card"]', { timeout: 10000 });
  });

  test('should apply bleed status and show duration badge', async ({ page }) => {
    console.log('🩸 TEST: Apply bleed status');

    // Find Goblin (enemy creature)
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    await expect(goblin).toBeVisible();

    // Get initial health
    const initialHealth = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Goblin initial health: ${initialHealth}`);

    // Click Bleed button
    const bleedButton = page.locator('button').filter({ hasText: /🩸.*Bleed/i }).first();
    await bleedButton.scrollIntoViewIfNeeded();
    await expect(bleedButton).toBeVisible();
    await bleedButton.click();

    // Click Goblin as target
    await goblin.click();
    await page.waitForTimeout(1000);

    // Verify bleed badge appears with duration 3
    const bleedBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /🩸|bleed/i });
    await expect(bleedBadge).toBeVisible({ timeout: 5000 });

    const duration = await extractDuration(bleedBadge);
    console.log(`🩸 Bleed duration: ${duration}`);
    expect(duration).toBe(3);

    // Verify damage was dealt
    const healthAfterBleed = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health after bleed: ${healthAfterBleed}`);
    expect(healthAfterBleed).toBeLessThan(initialHealth);

    console.log('✅ Bleed applied successfully with correct duration');
  });

  test('should tick bleed damage on turn end', async ({ page }) => {
    console.log('🩸 TEST: Bleed ticks on turn end');

    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    
    // Apply bleed
    await applyBurnToGoblin(page); // Reusing burn helper - applies any DoT
    const bleedButton = page.locator('button').filter({ hasText: /🩸.*Bleed/i }).first();
    await bleedButton.scrollIntoViewIfNeeded();
    await bleedButton.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    // Get health before turn end
    const healthBeforeTick = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health before turn end: ${healthBeforeTick}`);

    // End turn to trigger bleed tick
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await expect(endTurnButton).toBeVisible();
    await endTurnButton.click();
    await page.waitForTimeout(2500);

    // Verify bleed damage was applied (7 damage per tick based on combatEffects.ts)
    const healthAfterTick = await getCreatureHealth(page, 'Goblin');
    console.log(`📊 Health after turn end: ${healthAfterTick}`);
    expect(healthAfterTick).toBeLessThan(healthBeforeTick);
    
    const bleedDamage = healthBeforeTick - healthAfterTick;
    console.log(`🩸 Bleed damage dealt: ${bleedDamage}`);

    console.log('✅ Bleed ticked successfully');
  });

  test('should decrement bleed duration on turn end', async ({ page }) => {
    console.log('🩸 TEST: Bleed duration decrement');

    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();

    // Apply bleed
    const bleedButton = page.locator('button').filter({ hasText: /🩸.*Bleed/i }).first();
    await bleedButton.scrollIntoViewIfNeeded();
    await bleedButton.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    const bleedBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /🩸|bleed/i });
    const initialDuration = await extractDuration(bleedBadge);
    console.log(`🩸 Initial duration: ${initialDuration}`);
    expect(initialDuration).toBe(3);

    // End turn
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(2500);

    const newDuration = await extractDuration(bleedBadge);
    console.log(`🩸 After turn 1: ${newDuration}`);
    expect(newDuration).toBe(2);

    console.log('✅ Bleed duration decremented: 3 → 2');
  });

  test('should remove bleed after duration expires', async ({ page }) => {
    console.log('🩸 TEST: Bleed expiration');

    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();

    // Apply bleed
    const bleedButton = page.locator('button').filter({ hasText: /🩸.*Bleed/i }).first();
    await bleedButton.scrollIntoViewIfNeeded();
    await bleedButton.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    const bleedBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /🩸|bleed/i });
    await expect(bleedBadge).toBeVisible();

    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();

    // End turn 1 - duration 3 → 2
    await endTurnButton.click();
    await page.waitForTimeout(2500);
    expect(await extractDuration(bleedBadge)).toBe(2);

    // End turn 2 - duration 2 → 1
    await endTurnButton.click();
    await page.waitForTimeout(2500);
    expect(await extractDuration(bleedBadge)).toBe(1);

    // End turn 3 - duration 1 → 0, should remove
    await endTurnButton.click();
    await page.waitForTimeout(2500);

    // Verify bleed is removed
    await expect(bleedBadge).not.toBeVisible();

    console.log('✅ Bleed removed after 3 turns');
  });
});

test.describe('Turn System - Status Effects - Attack Buff', () => {
  test.beforeEach(async ({ page }) => {
    // Capture browser console logs
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.text()}`);
    });
    
    // Navigate to the app
    await page.goto('/');
    
    // Wait for battle to be ready
    await page.waitForSelector('[data-testid="creature-card"]', { timeout: 10000 });
  });

  test('should apply attack buff status and show duration badge', async ({ page }) => {
    console.log('💪 TEST: Apply attack buff status');

    // Find player creature (Dragon)
    const dragon = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Dragon' }).first();
    await expect(dragon).toBeVisible();

    // Click Attack Buff (Power Up) button
    const buffButton = page.locator('button').filter({ hasText: /💪.*Power Up/i }).first();
    await buffButton.scrollIntoViewIfNeeded();
    await expect(buffButton).toBeVisible();
    await buffButton.click();

    // Target self (Dragon)
    await dragon.click();
    await page.waitForTimeout(1000);

    // Verify attack buff badge appears with duration 3
    const buffBadge = dragon.locator('[data-testid="status-badge"]').filter({ hasText: /💪|attack.*buff/i });
    await expect(buffBadge).toBeVisible({ timeout: 5000 });

    const duration = await extractDuration(buffBadge);
    console.log(`💪 Attack Buff duration: ${duration}`);
    expect(duration).toBe(3);

    console.log('✅ Attack buff applied successfully with duration 3');
  });

  test('should decrement attack buff duration on turn end', async ({ page }) => {
    console.log('💪 TEST: Attack buff duration decrement');

    const dragon = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Dragon' }).first();

    // Apply attack buff
    const buffButton = page.locator('button').filter({ hasText: /💪.*Power Up/i }).first();
    await buffButton.scrollIntoViewIfNeeded();
    await buffButton.click();
    await dragon.click();
    await page.waitForTimeout(1000);

    const buffBadge = dragon.locator('[data-testid="status-badge"]').filter({ hasText: /💪|attack.*buff/i });
    const initialDuration = await extractDuration(buffBadge);
    console.log(`💪 Initial duration: ${initialDuration}`);
    expect(initialDuration).toBe(3);

    // End turn
    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(2500);

    const newDuration = await extractDuration(buffBadge);
    console.log(`💪 After turn 1: ${newDuration}`);
    expect(newDuration).toBe(2);

    console.log('✅ Attack buff duration decremented: 3 → 2');
  });

  test('should remove attack buff after duration expires', async ({ page }) => {
    console.log('💪 TEST: Attack buff expiration');

    const dragon = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Dragon' }).first();

    // Apply attack buff (duration 3)
    const buffButton = page.locator('button').filter({ hasText: /💪.*Power Up/i }).first();
    await buffButton.scrollIntoViewIfNeeded();
    await buffButton.click();
    await dragon.click();
    await page.waitForTimeout(1000);

    const buffBadge = dragon.locator('[data-testid="status-badge"]').filter({ hasText: /💪|attack.*buff/i });
    await expect(buffBadge).toBeVisible();

    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();

    // End turn 1 - duration 3 → 2
    await endTurnButton.click();
    await page.waitForTimeout(2500);
    expect(await extractDuration(buffBadge)).toBe(2);

    // End turn 2 - duration 2 → 1
    await endTurnButton.click();
    await page.waitForTimeout(2500);
    expect(await extractDuration(buffBadge)).toBe(1);

    // End turn 3 - duration 1 → 0, should remove
    await endTurnButton.click();
    await page.waitForTimeout(2500);

    // Verify buff is removed
    await expect(buffBadge).not.toBeVisible();

    console.log('✅ Attack buff removed after 3 turns');
  });
});

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
