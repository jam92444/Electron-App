import { purchaseReducer } from "./purchaseReducer";
import { settingsReducer } from "./settingReducer";
import { authReducer } from "./authReducer";

export function rootReducer(state, action) {
  return {
    settings: settingsReducer(state.settings, action),
    purchase: purchaseReducer(state.purchase, action),
    token: authReducer({ token: state.token, user: state.user }, action).token,
    user: authReducer({ token: state.token, user: state.user }, action).user,
  };
}
