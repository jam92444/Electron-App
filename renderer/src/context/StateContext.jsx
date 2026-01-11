/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer } from "react";
import { initialState } from "./reducer/initialState";
import { rootReducer } from "./reducer/rootReducer";

const StateContext = createContext();

export function StateProvider({ children }) {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
}

export function useStateContext() {
  return useContext(StateContext);
}
