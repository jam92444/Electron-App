export const initialState = {
  settings: {
    company: {},
    billing: {},
    other: {},
  },
  purchase: {
    currentPurchaseID: null,
    items: [],
  },
  token: "",
  user: {
    id: null,
    username: "",
    full_name: "",
    roles: {},
    permissions: [],
  },
};
