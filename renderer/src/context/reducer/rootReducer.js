import { settingsReducer } from "./settingReducer";

export function rootReducer(state, action) {
  return {
    settings: settingsReducer(state.settings, action),
  };
}
