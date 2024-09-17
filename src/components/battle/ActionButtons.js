import React from "react";
import ActionButton from "./ActionButton";

const ActionButtons = ({ handleAttack, handleHeal, handleIncreaseHealth, handleIncreaseMpPerTurn, handleIncreaseMaxMp, mp }) => {
  return (
    <div className="flex space-x-4 mb-4">
      <ActionButton onClick={handleAttack}>Attack</ActionButton>
      <ActionButton onClick={handleHeal} disabled={mp < 10}>
        Heal All (10 MP)
      </ActionButton>
      <div className="flex space-x-4">
        <ActionButton onClick={handleIncreaseHealth} disabled={mp < 10}>
          Boost Health (10 MP)
        </ActionButton>
        <ActionButton onClick={handleIncreaseMpPerTurn} disabled={mp < 10}>
          Increase MP Gain (10 MP)
        </ActionButton>
        <ActionButton onClick={handleIncreaseMaxMp} disabled={mp < 10}>
          Increase Max MP (10 MP)
        </ActionButton>
      </div>
    </div>
  );
};

export default ActionButtons;
