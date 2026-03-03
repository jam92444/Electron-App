// services/authService.js

export const loginUser = (credentials) => window.api.loginUser(credentials);

export const logoutUser = () => window.api.logoutUser();

export const restoreSession = async () => {
  return await window.api.restoreSession("db:restoreSession");
};

export const getCurrentUser = () => window.api.getCurrentUser();
