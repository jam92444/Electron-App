import {
  SET_TOKEN,
  USER_DATA,
  USER_ROLE,
  USER_PERMISSION,
  LOGOUT,
} from "./actionTypes";

export function authReducer(state, action) {
  switch (action.type) {
    case SET_TOKEN:
      return {
        ...state,
        token: action.payload,
      };

    case USER_DATA:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload, // Merge user details like id, username, full_name
        },
      };

    case USER_ROLE:
      return {
        ...state,
        user: {
          ...state.user,
          roles: action.payload, // Update roles array
        },
      };

    case USER_PERMISSION:
      return {
        ...state,
        user: {
          ...state.user,
          permissions: action.payload, // Update permissions array
        },
      };

    case LOGOUT:
      return {
        ...state,
        token: "",
        user: {
          id: null,
          username: "",
          full_name: "",
          roles: [],
          permissions: [],
        },
      };

    default:
      return state;
  }
}
