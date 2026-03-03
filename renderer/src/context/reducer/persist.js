/* eslint-disable no-empty */
export const loadAuthState = () => {
  try {
    const data = localStorage.getItem("auth");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveAuthState = (authState) => {
  try {
    localStorage.setItem("auth", JSON.stringify(authState));
  } catch {}
};

export const clearAuthState = () => {
  localStorage.removeItem("auth");
};
