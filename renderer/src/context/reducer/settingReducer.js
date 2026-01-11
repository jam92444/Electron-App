import {
  SET_COMPANY_SETTINGS,
  SET_BILLING_SETTINGS,
  SET_OTHER_SETTINGS,
} from "./actionTypes";

export function settingsReducer(state, action) {
  switch (action.type) {
    case SET_COMPANY_SETTINGS:
      return {
        ...state,
        company: {
          ...state.company,
          ...action.payload,
        },
      };

    case SET_BILLING_SETTINGS:
      return {
        ...state,
        billing: {
          ...state.billing,
          ...action.payload,
        },
      };

    case SET_OTHER_SETTINGS:
      return {
        ...state,
        other: {
          ...state.other,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}
