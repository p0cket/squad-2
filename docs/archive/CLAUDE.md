# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- **Start Dev Server**: `npm start` - Runs app in development mode at http://localhost:3000
- **Run Tests**: `npm test` - Launches Jest test runner in interactive watch mode
- **Build**: `npm run build` - Creates production build in `build/` folder
- **No linting commands** - Uses standard Create React App ESLint config (no separate lint command)

### Single Test Execution
Since this uses Create React App's test setup, run specific tests with:
```bash
npm test -- --testNamePattern="specific test name"
npm test -- --testPathPattern="path/to/test/file"
```

## Architecture Overview

### State Management
- **Primary**: React Context API with reducer pattern (`GameContext.tsx`)
- **Global State**: Game state, creatures, battles, modals, and animation queue
- **Actions**: Type-safe actions defined in `src/consts/types/actionTypes.ts`
- **State Types**: Comprehensive TypeScript interfaces in `src/consts/types/types.ts`

### Core Systems

**Battle Engine**
- Main attack processing in `src/utils/moves/performAttack.ts`
- Damage calculation in `src/utils/moves/calculateDamageAndStatuses.ts`
- Status effects system in `src/consts/statuses.ts`
- Turn-based combat with MP system and status effect timing

**Animation System**
- Animation queue system (`src/utils/anim/AnimationQueue.ts`)
- React hook integration (`src/hooks/useAnimationQueue.ts`)
- Framer Motion for battle animations
- Demo component at `src/components/AnimationQueueDemo.tsx`

**Creature System**
- Creature data in `src/consts/creatures.ts`
- Unique ID-based identity (`creature.ID` not array index)
- Support for player and computer parties
- Status effects, mods, and stat management

### Key Development Patterns

**State Updates**
- Always use `creature.ID` for identity, never array indices
- Never mutate state directly - use reducer actions
- Dispatch `UPDATE_CREATURE` action for creature changes
- Use structured cloning for deep object copies

**Battle Flow**
1. Player input → `AttackPayload` creation
2. Validation and pre-attack effects
3. Damage/status calculation (pure functions)
4. Animation queue operations
5. Immutable state updates via dispatch
6. Post-attack effects and cleanup

**Component Communication**
- Pass full objects (e.g., `creatureObj`) rather than IDs when possible
- Modal state controlled via context, not local state
- Use `useStateContext()` and `useDispatchContext()` hooks

## Technology Stack

- **Frontend**: React 18 with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **Testing**: Jest with React Testing Library
- **State**: Context API with useReducer
- **Styling**: Tailwind utility classes (avoid inline styles except for dynamic animations)

## Project Structure

```
src/
├── components/          # React components organized by feature
├── consts/             # Game constants, creatures, items, types
├── hooks/              # Custom React hooks
├── utils/              # Pure utility functions
│   ├── moves/          # Attack and battle logic
│   ├── anim/           # Animation system
│   └── party/          # Party/creature management
├── firebase/           # Firebase integration
└── debug/              # Debug and testing components
```

## Important Files

- `src/GameContext.tsx` - Central state management and reducer
- `src/consts/types/types.ts` - Core TypeScript interfaces
- `src/consts/types/actionTypes.ts` - Redux-style action definitions
- `plans/BATTLE_ENGINE.md` - Detailed technical implementation docs
- `plans/MASTER_PLAN.md` - Project strategy and roadmap
- `.github/copilot-instructions.md` - Additional development patterns

## Firebase Integration

- Authentication via `src/firebase/auth.js`
- Firestore operations in `src/firebase/FireInput.js`
- Use `addNewDoc`/`loadDoc` for CRUD operations
- Cloud Functions for server-side logic

## Development Notes

- Creatures use unique IDs (`creature.ID`) for all operations
- Animation queue is mutable object - handle carefully
- Status effects have timing phases: `beforeAttack`, `afterAttack`, `endOfTurn`
- Battle system currently in active development - see `plans/BATTLE_ENGINE.md` for current status
- Debug components available in `src/debug/` for testing battle mechanics