import {
  SET_PURCHASE,
  SET_PURCHASE_ITEMS,
  RESET_PURCHASE,
} from "./actionTypes";

export function purchaseReducer(state, action) {
  switch (action.type) {
    case SET_PURCHASE:
      return {
        ...state,
        currentPurchaseID: action.payload,
      };

    case SET_PURCHASE_ITEMS:
      return {
        ...state,
        items: action.payload,
      };

    case RESET_PURCHASE:
      return {
        currentPurchaseID: null,
        items: [],
      };

    default:
      return state;
  }
}
