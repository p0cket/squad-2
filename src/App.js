// App.js
import React from 'react';
import { GameProvider } from './GameContext';
import CreatureBattleGame from './components/CreatureBattleGame';
import RuneShop from './components/RuneShop';
import OwnedRunes from './components/OwnedRunes';
import CreatureStats from './components/CreatureStats';


function App() {
  return (
    <GameProvider>
      <div className="container mx-auto px-4 py-8">
        <CreatureBattleGame />
        {/* <RuneShop />
        <OwnedRunes />
        <CreatureStats /> */}
      </div>
    </GameProvider>
  );
}

export default App;
