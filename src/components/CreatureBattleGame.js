import React, { createContext, useContext, useState, useCallback, useEffect, useReducer } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

const MAX_HP = 100;
const INITIAL_MAX_MP = 50;
const INITIAL_MP_PER_TURN = 5;

// Game Context
const GameContext = createContext();

// Game Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CREATURE':
      return {
        ...state,
        [action.side]: state[action.side].map(creature =>
          creature.name === action.creature.name ? { ...creature, ...action.creature } : creature
        )
      };
    case 'UPDATE_MP':
      return { ...state, mp: action.mp };
    case 'UPDATE_MAX_MP':
      return { ...state, maxMp: action.maxMp };
    case 'UPDATE_MP_PER_TURN':
      return { ...state, mpPerTurn: action.mpPerTurn };
    case 'INCREMENT_TURN':
      return { ...state, turn: state.turn + 1 };
    default:
      return state;
  }
};

const Creature = ({ name, health, position, controls, isPlayer }) => {
  const { state } = useContext(GameContext);
  return (
    <motion.div 
      className={`flex flex-col items-center ${health <= 0 ? 'opacity-50' : ''}`}
      animate={controls}
      initial={position}
    >
      <motion.div 
        className={`text-6xl mb-2 ${health <= 0 ? 'hidden' : ''}`}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {name}
      </motion.div>
      {health <= 0 && <div className="text-6xl mb-2">❌</div>}
      <div className="bg-gray-700 w-24 h-4 rounded-full overflow-hidden">
        <motion.div 
          className="bg-green-500 h-full"
          initial={{ width: '100%' }}
          animate={{ width: `${(health / MAX_HP) * 100}%` }}
        />
      </div>
      <div className="mt-1">{health} / {MAX_HP}</div>
    </motion.div>
  );
};

const ActionButton = ({ onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

const CreatureBattleGame = () => {
  const [state, dispatch] = useReducer(gameReducer, {
    playerCreatures: [
      { name: '🐉', health: MAX_HP, controls: useAnimationControls() },
      { name: '🦄', health: MAX_HP, controls: useAnimationControls() }
    ],
    computerCreatures: [
      { name: '👾', health: MAX_HP, controls: useAnimationControls() },
      { name: '🐙', health: MAX_HP, controls: useAnimationControls() }
    ],
    mp: 0,
    maxMp: INITIAL_MAX_MP,
    mpPerTurn: INITIAL_MP_PER_TURN,
    turn: 0
  });

  useEffect(() => {
    dispatch({ type: 'UPDATE_MP', mp: Math.min(state.mp + state.mpPerTurn, state.maxMp) });
  }, [state.turn]);

  const attackAnimation = useCallback(async (attacker, target, isPlayerAttack) => {
    const direction = isPlayerAttack ? 1 : -1;
    const distance = 300;
    
    await attacker.controls.start({ x: direction * distance, transition: { duration: 0.5 } });
    await attacker.controls.start({ x: direction * (distance + 10), y: [0, -5, 5, -5, 5, 0], transition: { duration: 0.3 } });
    
    if (target.health > 0) {
      await target.controls.start({ x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.3 } });
    }
    
    await attacker.controls.start({ x: 0, transition: { duration: 0.5 } });
    
    const damage = Math.floor(Math.random() * 20) + 10;
    return Math.max(0, target.health - damage);
  }, []);

  const handleAttack = useCallback(async () => {
    dispatch({ type: 'INCREMENT_TURN' });

    const alivePlayerCreatures = state.playerCreatures.filter(c => c.health > 0);
    const aliveComputerCreatures = state.computerCreatures.filter(c => c.health > 0);
    
    if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
      const playerAttacker = alivePlayerCreatures[Math.floor(Math.random() * alivePlayerCreatures.length)];
      const computerTarget = aliveComputerCreatures[Math.floor(Math.random() * aliveComputerCreatures.length)];
      const computerNewHealth = await attackAnimation(playerAttacker, computerTarget, true);
      dispatch({ 
        type: 'UPDATE_CREATURE', 
        side: 'computerCreatures', 
        creature: { ...computerTarget, health: computerNewHealth } 
      });
    }

    // Computer attack
    if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
      const computerAttacker = aliveComputerCreatures[Math.floor(Math.random() * aliveComputerCreatures.length)];
      const playerTarget = alivePlayerCreatures[Math.floor(Math.random() * alivePlayerCreatures.length)];
      const playerNewHealth = await attackAnimation(computerAttacker, playerTarget, false);
      dispatch({ 
        type: 'UPDATE_CREATURE', 
        side: 'playerCreatures', 
        creature: { ...playerTarget, health: playerNewHealth } 
      });
    }
  }, [state.playerCreatures, state.computerCreatures, attackAnimation]);

  const handleHeal = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: 'UPDATE_MP', mp: state.mp - 10 });
      dispatch({ type: 'INCREMENT_TURN' });
      state.playerCreatures.forEach(creature => {
        dispatch({
          type: 'UPDATE_CREATURE',
          side: 'playerCreatures',
          creature: { ...creature, health: Math.min(creature.health + 20, MAX_HP) }
        });
      });
    }
  }, [state.mp, state.playerCreatures]);

  const handleIncreaseHealth = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: 'UPDATE_MP', mp: state.mp - 10 });
      dispatch({ type: 'INCREMENT_TURN' });
      const target = state.playerCreatures[Math.floor(Math.random() * state.playerCreatures.length)];
      dispatch({
        type: 'UPDATE_CREATURE',
        side: 'playerCreatures',
        creature: { ...target, health: Math.min(target.health + 30, MAX_HP) }
      });
    }
  }, [state.mp, state.playerCreatures]);

  const handleIncreaseMpPerTurn = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: 'UPDATE_MP', mp: state.mp - 10 });
      dispatch({ type: 'INCREMENT_TURN' });
      dispatch({ type: 'UPDATE_MP_PER_TURN', mpPerTurn: state.mpPerTurn + 2 });
    }
  }, [state.mp, state.mpPerTurn]);

  const handleIncreaseMaxMp = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: 'UPDATE_MP', mp: state.mp - 10 });
      dispatch({ type: 'INCREMENT_TURN' });
      dispatch({ type: 'UPDATE_MAX_MP', maxMp: state.maxMp + 10 });
    }
  }, [state.mp, state.maxMp]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4">
        <h1 className="text-4xl font-bold mb-8 text-yellow-400">Creature Battle</h1>
        <div className="bg-gray-700 w-64 h-6 rounded-full overflow-hidden mb-4">
          <motion.div 
            className="bg-blue-500 h-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(state.mp / state.maxMp) * 100}%` }}
          />
        </div>
        <div className="mb-4">MP: {state.mp} / {state.maxMp} (Gain {state.mpPerTurn} per turn)</div>
        <div className="flex justify-between w-full max-w-3xl mb-8">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-green-400">Player</h2>
            {state.playerCreatures.map(creature => (
              <Creature key={creature.name} {...creature} position={{ x: 0 }} isPlayer={true} />
            ))}
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Computer</h2>
            {state.computerCreatures.map(creature => (
              <Creature key={creature.name} {...creature} position={{ x: 0 }} isPlayer={false} />
            ))}
          </div>
        </div>
        <div className="flex space-x-4 mb-4">
          <ActionButton onClick={handleAttack}>Attack</ActionButton>
          <ActionButton onClick={handleHeal} disabled={state.mp < 10}>Heal All (10 MP)</ActionButton>
        </div>
        <div className="flex space-x-4">
          <ActionButton onClick={handleIncreaseHealth} disabled={state.mp < 10}>Boost Health (10 MP)</ActionButton>
          <ActionButton onClick={handleIncreaseMpPerTurn} disabled={state.mp < 10}>Increase MP Gain (10 MP)</ActionButton>
          <ActionButton onClick={handleIncreaseMaxMp} disabled={state.mp < 10}>Increase Max MP (10 MP)</ActionButton>
        </div>
        <div className="mt-4">Turn: {state.turn}</div>
      </div>
    </GameContext.Provider>
  );
};

export default CreatureBattleGame;