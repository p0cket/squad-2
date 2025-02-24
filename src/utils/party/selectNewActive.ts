// import { Dispatch } from 'react';

// type Action = {
//   type: "SWAP_CREATURE_POSITION";
//   payload: {
//     side: string;
//     newActiveCreatureID: number;
//   };
// };

// const selectNewActive = (
//   newActiveCreatureID: number,
//   dispatch: Dispatch<Action>,
//   setSelectNewActive: React.Dispatch<React.SetStateAction<boolean>>
// ): void => {
//   setSelectNewActive(false);
//   dispatch({
//     type: "SWAP_CREATURE_POSITION",
//     payload: {
//       side: "playerCreatures",
//       newActiveCreatureID,
//     },
//   });
// };