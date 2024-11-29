import React from "react";
import { Attack } from "../consts/types";
import { STATUS_EFFECTS } from "../consts/statuses";

function AttacksDisplay({ attacks }: { attacks: Attack[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
      {attacks.map((attack) => (
        <div
          key={attack.name}
          className="bg-white shadow-lg rounded-lg p-1 hover:shadow-xl transition-shadow"
        >
          <AttackItem attack={attack} />
        </div>
      ))}
    </div>
  );
}

export default AttacksDisplay;

function AttackItem({ attack }: { attack: Attack }) {
  return (
    <button className="w-full bg-blue-500 text-white rounded-lg shadow-md p-1 hover:bg-blue-600 transition-colors">
      <p className="flex items-center space-x-2">
        {/* <span>{attack.icon}</span> */}
        <span className="font-semibold">{attack.name}</span>
        <span>
          {attack.effects?.[0] && STATUS_EFFECTS[attack.effects[0]].icon}
        </span>
      </p>{" "}
      {/* <p>{attack.name}</p>
      <p>Type: {attack.attackType}</p>
      <p>Damage: {attack.damage}</p>
      <p>Effects: {attack.effects.join(", ")}</p> */}
      {/* Add more fields as needed */}
    </button>
  );
}
