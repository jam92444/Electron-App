import { purchaseReducer } from "./purchaseReducer";
import { settingsReducer } from "./settingReducer";

export function rootReducer(state, action) {
  return {
    settings: settingsReducer(state.settings, action),
    purchase: purchaseReducer(state.purchase, action),
  };
}
