import { GET_BILL_DATA, SET_BILL_DATA } from "./actionTypes";

export function billReducer(state, action) {
  switch (action.type) {
    case GET_BILL_DATA:
      return state;
    case SET_BILL_DATA:
      return { ...state };

    default:
      return state;
  }
}
