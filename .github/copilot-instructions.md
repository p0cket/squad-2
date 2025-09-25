# Copilot Coding Agent Instructions for Squad-2

## Project Overview
- **Type:** React (TypeScript/JavaScript) game application, bootstrapped with Create React App.
- **Domain:** Turn-based battle engine with creatures, runes, and animation queue.
- **Key Folders:**
  - `src/`: Main source code (components, contexts, hooks, utils, firebase integration)
  - `plans/`: Project and technical documentation (`MASTER_PLAN.md`, `BATTLE_ENGINE.md`)
  - `public/`, `build/`: Static assets and build outputs

## Architecture & Patterns
- **State Management:**
  - Uses React Contexts (`GameContext.tsx`, `GameContext2.js`, `authContext/`) for global state (creatures, runes, modals, etc).
  - Reducer pattern for game state transitions; actions are defined in `src/consts/types/actionTypes.ts`.
- **Battle Engine:**
  - Core logic in `GameContext.tsx`/`GameContext2.js` and `battle/` utils.
  - Creature, attack, and rune logic is modularized in `components/`, `consts/`, and `utils/`.
  - Animation queue system (see `useAnimationQueue.ts`, `AnimationQueueDemo.tsx`).
- **UI:**
  - Components are in `src/components/`, organized by feature (battle, hand, modals, runes, etc).
  - Uses Tailwind CSS for styling (`index.css`, `tailwind.config.js`).
  - Framer Motion is used for animations.
- **Modals:**
  - Modal components are in `components/modals/` and are controlled via context state (e.g., `ReplaceCreatureModal`, `ChooseTargetsModal`).
- **Firebase:**
  - Firestore integration in `src/firebase/` (see `FireInput.js`, `auth.js`).

## Developer Workflows
- **Start Dev Server:** `npm start`
- **Run Tests:** `npm test` (Jest, see `App.test.js`)
- **Build:** `npm run build`
- **Linting:** Standard Create React App ESLint config
- **Debugging:**
  - Use debug components in `src/debug/` (e.g., `AttackDebugConsole.tsx`)
  - Console logging is common for state/action tracing

## Project-Specific Conventions
- **Creature IDs:** Always use `creature.ID` for identity, not array index.
- **State Mutations:** Never mutate state directly; always use reducer actions.
- **Component Props:** Pass full objects (e.g., `creatureObj`) rather than IDs when possible.
- **Modals:** Open/close via context state, not local state.
- **Action Types:** Extend from `Action<>` or `ClassicAction<>` in `actionTypes.ts`.
- **Styling:** Use Tailwind utility classes; avoid inline styles except for dynamic animation.

## Integration & Cross-Component Patterns
- **Animation Queue:**
  - Add animations via reducer actions; process queue in `useAnimationQueue.ts`.
  - See `AnimationQueueDemo.tsx` for usage.
- **Creature Replacement:**
  - Use `SWAP_CREATURE_POSITION` and `MOVE_CREATURE_TO_BACK` actions for party management.
  - Modals for replacement are in `modals/` and triggered by state.
- **Firebase:**
  - Use `addNewDoc`/`loadDoc` in `FireInput.js` for Firestore CRUD.

## References
- See `plans/BATTLE_ENGINE.md` for technical details and implementation notes.
- See `plans/MASTER_PLAN.md` for project strategy and roadmap.

---

**When in doubt, follow patterns in `GameContext.tsx`, `GameContext2.js`, and `src/components/`.**
