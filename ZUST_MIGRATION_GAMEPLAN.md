# Zust Squad Rebirth: Squad 2 Migration Gameplan

> A step-by-step, checkpoint-driven plan to migrate Squad 2's battle engine and game features into the modern Zust Squad Rebirth framework.

---

## Executive Summary

**Goal**: Transform Zust Squad Rebirth into a modern, performant remake of Squad 2 while preserving all core gameplay mechanics.

**Strategy**: Incremental migration with proof-of-concept checkpoints, starting with core data structures and building up to full battle engine integration.

**Timeline**: 8-12 weeks with weekly checkpoint reviews

---

## Migration Foundation

### Current State Analysis

**Squad 2 (Source)**
- React + TypeScript battle engine
- Complex state management via GameContext
- Comprehensive creature/attack/status systems
- Working animation queue infrastructure
- 113+ files with battle logic, UI components, and utilities

**Zust Squad Rebirth (Target)**
- Modern Vite + React + TypeScript setup
- Zustand for state management
- Clean project structure
- Minimal existing code to conflict with

---

## Phase 1: Foundation & Data Migration (Week 1-2)

### Checkpoint 1.1: Core Type Definitions
**Goal**: Establish type-safe foundation for all game entities

**Tasks**:
- [ ] Copy core types from `squad-2/src/consts/types/types.ts`
- [ ] Copy action types from `squad-2/src/consts/types/actionTypes.ts`
- [ ] Create `zust-squad-rebirth/src/types/` directory structure
- [ ] Adapt types for Zustand store patterns

**Proof of Concept**: TypeScript compilation with no errors
```bash
cd zust-squad-rebirth
npm run build
# Should compile cleanly with all types imported
```

**Files to Create**:
- `src/types/creatures.ts`
- `src/types/attacks.ts`
- `src/types/statusEffects.ts`
- `src/types/gameState.ts`
- `src/types/actions.ts`

### Checkpoint 1.2: Game Data Migration
**Goal**: Import all creature, attack, and status definitions

**Tasks**:
- [ ] Copy creature definitions from `squad-2/src/consts/creatures.ts`
- [ ] Copy attack definitions from `squad-2/src/consts/attacks.ts`
- [ ] Copy status effects from `squad-2/src/consts/statuses.ts`
- [ ] Create data validation utilities
- [ ] Set up data import/export helpers

**Proof of Concept**: Data integrity verification
```typescript
// Test script to verify all data imports correctly
import { CREATURES } from './src/data/creatures'
import { ATTACKS } from './src/data/attacks'
import { STATUS_EFFECTS } from './src/data/statuses'

console.log(`Loaded ${Object.keys(CREATURES).length} creatures`)
console.log(`Loaded ${Object.keys(ATTACKS).length} attacks`)
console.log(`Loaded ${Object.keys(STATUS_EFFECTS).length} status effects`)
```

**Files to Create**:
- `src/data/creatures.ts`
- `src/data/attacks.ts`
- `src/data/statuses.ts`
- `src/data/validators.ts`

### Checkpoint 1.3: Zustand Store Architecture
**Goal**: Establish state management foundation

**Tasks**:
- [ ] Design Zustand store slices for different game systems
- [ ] Create battle state slice
- [ ] Create collection state slice
- [ ] Create UI state slice
- [ ] Implement store persistence
- [ ] Add devtools integration

**Proof of Concept**: Store operations work correctly
```typescript
// Test store operations
const { battleState, updateCreature, addStatusEffect } = useGameStore()
// Should update state immutably and trigger re-renders
```

**Files to Create**:
- `src/store/battleSlice.ts`
- `src/store/collectionSlice.ts`
- `src/store/uiSlice.ts`
- `src/store/index.ts`

---

## Phase 2: Core Engine Migration (Week 3-4)

### Checkpoint 2.1: Damage Calculation Engine
**Goal**: Port core battle math and ensure accuracy

**Tasks**:
- [ ] Copy damage calculation from `squad-2/src/utils/moves/calculateDamageAndStatuses.ts`
- [ ] Adapt for Zustand state patterns
- [ ] Create comprehensive unit tests
- [ ] Add deterministic RNG seeding
- [ ] Validate against Squad 2 test cases

**Proof of Concept**: Math accuracy verification
```typescript
// Unit test suite
describe('Damage Calculation', () => {
  it('should match Squad 2 damage output for identical inputs', () => {
    const result = calculateDamage(testAttacker, testTarget, testAttack)
    expect(result.damage).toBe(expectedDamage)
    expect(result.appliedStatuses).toEqual(expectedStatuses)
  })
})
```

**Files to Create**:
- `src/engine/damageCalculation.ts`
- `src/engine/statusEffects.ts`
- `src/engine/__tests__/damageCalc.test.ts`

### Checkpoint 2.2: Attack Pipeline
**Goal**: Implement complete attack lifecycle

**Tasks**:
- [ ] Port attack orchestration from `squad-2/src/utils/moves/performAttack.ts`
- [ ] Implement attack validation
- [ ] Add pre/post attack effect processing
- [ ] Create attack payload system
- [ ] Integrate with Zustand store

**Proof of Concept**: Complete attack execution
```typescript
// Integration test
const executeAttack = (attackerId: string, targetId: string, attackId: string) => {
  // Should validate, calculate, apply damage, and update store
  const result = performAttack({ attackerId, targetId, attackId })
  expect(result.success).toBe(true)
  expect(getCreature(targetId).health).toBeLessThan(originalHealth)
}
```

**Files to Create**:
- `src/engine/attackPipeline.ts`
- `src/engine/attackValidation.ts`
- `src/engine/__tests__/attackPipeline.test.ts`

### Checkpoint 2.3: Turn Management
**Goal**: Implement turn-based battle flow

**Tasks**:
- [ ] Port turn processing from `squad-2/src/utils/turn/`
- [ ] Implement end-of-turn effects
- [ ] Add turn order calculation
- [ ] Create game over detection
- [ ] Add battle state transitions

**Proof of Concept**: Complete battle simulation
```typescript
// Battle simulation test
const runBattleSimulation = () => {
  initializeBattle(playerTeam, enemyTeam)
  while (!isBattleOver()) {
    const nextActor = getNextActor()
    const action = selectAIAction(nextActor) // or player input
    executeAction(action)
    processTurnEffects()
  }
  const winner = getBattleWinner()
  expect(winner).toBeDefined()
}
```

**Files to Create**:
- `src/engine/turnManager.ts`
- `src/engine/battleFlow.ts`
- `src/engine/__tests__/turnManager.test.ts`

---

## Phase 3: Animation & UI Integration (Week 5-6)

### Checkpoint 3.1: Animation Queue System
**Goal**: Port and modernize animation infrastructure

**Tasks**:
- [ ] Port animation queue from `squad-2/src/utils/anim/AnimationQueue.ts`
- [ ] Integrate with Zustand store
- [ ] Add priority-based animation sequencing
- [ ] Create animation debugging tools
- [ ] Add performance optimizations

**Proof of Concept**: Smooth animation playback
```typescript
// Animation test
const queueAttackAnimation = (attackerId: string, targetId: string) => {
  addAnimation({ type: 'ATTACK_WINDUP', actorId: attackerId })
  addAnimation({ type: 'DAMAGE_IMPACT', targetId })
  addAnimation({ type: 'STATUS_APPLY', targetId, statusId: 'poison' })
  processAnimationQueue() // Should play in sequence
}
```

**Files to Create**:
- `src/animation/AnimationQueue.ts`
- `src/animation/animationTypes.ts`
- `src/animation/hooks/useAnimationQueue.ts`

### Checkpoint 3.2: Battle UI Components
**Goal**: Create modern, responsive battle interface

**Tasks**:
- [ ] Port creature display components
- [ ] Create attack selection UI
- [ ] Implement status effect displays
- [ ] Add battle log component
- [ ] Create responsive layout system

**Proof of Concept**: Interactive battle screen
```typescript
// UI integration test
const BattleScreen = () => {
  const { playerCreatures, enemyCreatures } = useGameStore()
  // Should render creatures, handle click events, update in real-time
  return (
    <div className="battle-screen">
      <CreatureGroup creatures={playerCreatures} isPlayer />
      <AttackSelection onSelectAttack={handleAttackSelect} />
      <CreatureGroup creatures={enemyCreatures} isEnemy />
    </div>
  )
}
```

**Files to Create**:
- `src/components/battle/BattleScreen.tsx`
- `src/components/battle/CreatureDisplay.tsx`
- `src/components/battle/AttackSelection.tsx`
- `src/components/battle/StatusDisplay.tsx`

### Checkpoint 3.3: Animation Integration
**Goal**: Connect animations to battle events

**Tasks**:
- [ ] Port animation functions from Squad 2
- [ ] Create Framer Motion integration
- [ ] Add damage number displays
- [ ] Implement status effect animations
- [ ] Add screen shake and particle effects

**Proof of Concept**: Polished battle animations
```typescript
// Animation showcase
const demonstrateAnimations = () => {
  // Attack animation
  triggerAttackAnimation('fireball', attackerId, targetId)
  // Damage display
  showDamageNumber(120, targetPosition)
  // Status effect
  animateStatusApplication('burn', targetId)
  // All animations should be smooth and synchronized
}
```

**Files to Create**:
- `src/animation/battleAnimations.ts`
- `src/animation/effects/damageNumbers.tsx`
- `src/animation/effects/statusEffects.tsx`

---

## Phase 4: Advanced Features (Week 7-8)

### Checkpoint 4.1: Collection System
**Goal**: Implement creature collection and team building

**Tasks**:
- [ ] Create creature collection interface
- [ ] Implement team composition tools
- [ ] Add creature rarity and stats display
- [ ] Create creature filtering and sorting
- [ ] Add team preset saving/loading

**Proof of Concept**: Complete team management
```typescript
// Collection management test
const manageCollection = () => {
  const collection = getPlayerCollection()
  const team = buildTeam([creatureId1, creatureId2, creatureId3])
  saveTeamPreset('main-team', team)
  const loadedTeam = loadTeamPreset('main-team')
  expect(loadedTeam).toEqual(team)
}
```

### Checkpoint 4.2: Progression Systems
**Goal**: Add leveling, experience, and advancement

**Tasks**:
- [ ] Implement creature experience system
- [ ] Add level-up stat calculations
- [ ] Create skill point allocation
- [ ] Add evolution mechanics
- [ ] Implement achievement system

**Proof of Concept**: Character progression
```typescript
// Progression test
const testProgression = () => {
  const creature = getCreature(creatureId)
  gainExperience(creature, 1000)
  if (canLevelUp(creature)) {
    levelUp(creature)
    expect(creature.level).toBe(originalLevel + 1)
    expect(creature.stats.attack).toBeGreaterThan(originalAttack)
  }
}
```

### Checkpoint 4.3: Campaign Mode
**Goal**: Implement PvE campaign structure

**Tasks**:
- [ ] Create level generation system
- [ ] Implement campaign progression
- [ ] Add difficulty scaling
- [ ] Create boss encounters
- [ ] Add reward systems

**Proof of Concept**: Playable campaign
```typescript
// Campaign test
const playCampaignLevel = (levelId: string) => {
  const level = generateLevel(levelId)
  const battle = initializeCampaignBattle(playerTeam, level.enemyTeam)
  const result = playBattle(battle)
  if (result.victory) {
    unlockNextLevel(levelId)
    awardRewards(level.rewards)
  }
}
```

---

## Phase 5: Polish & Performance (Week 9-10)

### Checkpoint 5.1: Performance Optimization
**Goal**: Ensure smooth 60fps gameplay

**Tasks**:
- [ ] Implement React.memo optimizations
- [ ] Add Zustand store selectors
- [ ] Optimize animation performance
- [ ] Add bundle size analysis
- [ ] Implement lazy loading

**Proof of Concept**: Performance benchmarks
```bash
# Performance tests
npm run build:analyze
npm run lighthouse
# Should show improved bundle size and performance scores
```

### Checkpoint 5.2: Mobile Responsiveness
**Goal**: Ensure excellent mobile experience

**Tasks**:
- [ ] Implement responsive design system
- [ ] Add touch gesture support
- [ ] Optimize for various screen sizes
- [ ] Add PWA capabilities
- [ ] Test on real devices

**Proof of Concept**: Cross-device compatibility
```typescript
// Responsive design test
const testResponsiveness = () => {
  // Should work on desktop, tablet, and mobile
  // Touch interactions should be smooth
  // UI should adapt to screen orientation
}
```

### Checkpoint 5.3: Quality Assurance
**Goal**: Comprehensive testing and bug fixing

**Tasks**:
- [ ] Achieve 90%+ test coverage
- [ ] Add E2E testing with Playwright
- [ ] Implement visual regression testing
- [ ] Add accessibility compliance
- [ ] Performance profiling

**Proof of Concept**: Quality metrics
```bash
# Quality gates
npm run test:coverage  # >90% coverage
npm run test:e2e      # All user flows pass
npm run lint          # Zero lint errors
npm run accessibility # WCAG compliance
```

---

## Phase 6: Launch Preparation (Week 11-12)

### Checkpoint 6.1: Deployment Pipeline
**Goal**: Automated deployment and monitoring

**Tasks**:
- [ ] Set up CI/CD pipeline
- [ ] Configure staging environment
- [ ] Implement error monitoring
- [ ] Add performance monitoring
- [ ] Create deployment documentation

**Proof of Concept**: Reliable deployments
```yaml
# CI/CD pipeline test
name: Deploy Zust Squad Rebirth
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Test
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy
        run: npm run deploy
```

### Checkpoint 6.2: Documentation & Onboarding
**Goal**: Complete project documentation

**Tasks**:
- [ ] Create developer documentation
- [ ] Add gameplay tutorials
- [ ] Document architecture decisions
- [ ] Create troubleshooting guides
- [ ] Add contribution guidelines

**Proof of Concept**: Self-documenting project
```markdown
# Documentation checklist
- [ ] README with setup instructions
- [ ] Architecture decision records
- [ ] API documentation
- [ ] Troubleshooting guide
- [ ] Contribution guidelines
```

### Checkpoint 6.3: Feature Parity Verification
**Goal**: Ensure complete Squad 2 feature migration

**Tasks**:
- [ ] Create feature comparison matrix
- [ ] Test all battle mechanics
- [ ] Verify animation fidelity
- [ ] Confirm data integrity
- [ ] Validate performance improvements

**Proof of Concept**: Feature parity achieved
```typescript
// Feature parity test suite
describe('Squad 2 Feature Parity', () => {
  it('should have all original creatures', () => {
    expect(getCreatureCount()).toBe(SQUAD2_CREATURE_COUNT)
  })
  
  it('should have all original attacks', () => {
    expect(getAttackCount()).toBe(SQUAD2_ATTACK_COUNT)
  })
  
  it('should maintain battle mechanic accuracy', () => {
    // Comprehensive battle system tests
  })
})
```

---

## Risk Mitigation Strategies

### Technical Risks
- **Complex State Migration**: Incremental migration with extensive testing
- **Animation Performance**: Performance profiling at each checkpoint
- **Mobile Compatibility**: Early device testing and responsive design

### Timeline Risks
- **Scope Creep**: Strict checkpoint gates and feature freeze periods
- **Integration Issues**: Continuous integration and automated testing
- **Performance Problems**: Regular performance audits and optimization

### Quality Risks
- **Feature Regression**: Comprehensive test suite with Squad 2 comparisons
- **User Experience**: Regular UX reviews and player testing
- **Data Loss**: Robust data validation and backup strategies

---

## Success Metrics

### Technical Metrics
- [ ] 100% feature parity with Squad 2
- [ ] 90%+ test coverage
- [ ] <2s initial load time
- [ ] 60fps animations on mobile
- [ ] Zero critical bugs in production

### User Experience Metrics
- [ ] Improved mobile usability scores
- [ ] Faster battle resolution times
- [ ] Smoother animation performance
- [ ] Better accessibility compliance
- [ ] Enhanced visual polish

### Development Metrics
- [ ] Reduced bundle size vs Squad 2
- [ ] Faster development iteration
- [ ] Better code maintainability
- [ ] Improved TypeScript coverage
- [ ] Modern tooling integration

---

## Weekly Review Process

### Checkpoint Reviews
1. **Demo Session**: Show working features to stakeholders
2. **Code Review**: Technical assessment and quality gates
3. **Performance Check**: Benchmark against previous week
4. **Risk Assessment**: Identify and mitigate emerging risks
5. **Planning Adjustment**: Adapt timeline based on progress

### Delivery Artifacts
- Working demonstration
- Test coverage reports
- Performance benchmarks
- Updated documentation
- Risk mitigation updates

---

## Final Delivery

### Launch-Ready Deliverables
- [ ] Fully functional Zust Squad Rebirth with complete Squad 2 feature parity
- [ ] Comprehensive test suite with 90%+ coverage
- [ ] Complete documentation and onboarding materials
- [ ] Optimized performance for web and mobile
- [ ] Automated deployment pipeline
- [ ] Error monitoring and analytics integration

### Post-Launch Support
- [ ] Bug fix prioritization process
- [ ] Feature enhancement pipeline
- [ ] Community feedback integration
- [ ] Performance monitoring and optimization
- [ ] Regular security updates

---

**This gameplan provides a structured, checkpoint-driven approach to migrating Squad 2 into the modern Zust Squad Rebirth framework while maintaining quality, performance, and feature parity throughout the process.**
