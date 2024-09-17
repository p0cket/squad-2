import React from "react";
import { useDispatchContext, useStateContext } from "../GameContext";
import RuneCard from "./RuneCard";
import SmallRune from "./SmallRune";

function OwnedRunes() {
  const state = useStateContext();
  const dispatch = useDispatchContext();

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Owned Runes</h2>
      {state.runes.length === 0 ? (
        <p>You don't own any runes yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.runes.map((rune, index) => (
            <SmallRune
              key={index}
              rune={rune}
              onAction={() => dispatch({ type: 'SELL_RUNE', rune, index })}
              actionLabel="Sell"
              isShop={false}
              isConcise={true} // Pass a prop to control the concise view
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default OwnedRunes;

// // OwnedRunes.js
// import React from "react";
// import { useDispatchContext, useStateContext } from "../GameContext";
// import RuneCard from "./RuneCard";

// function OwnedRunes() {
//   const state = useStateContext();
//   const dispatch = useDispatchContext();

//   return (
//     <div className="bg-gray-800 p-4 rounded-lg mt-8">
//       <h2 className="text-2xl font-bold mb-4">Owned Runes</h2>
//       {state.runes.length === 0 ? (
//         <p>You don't own any runes yet.</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {state.runes.map((rune, index) => (
//             <RuneCard
//               key={index}
//               rune={rune}
//               onAction={() => dispatch({ type: 'SELL_RUNE', rune, index })}
//               actionLabel="Sell"
//               isShop={false}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default OwnedRunes;
