// state/reducer.js
export const initialState = {
  companyData: {},
};

export function reducer(state, action) {
  switch (action.type) {
    case "COMPANYDATA":
      return {
        ...initialState,
        companyData: { ...initialState.companyData, ...action.payload },
      };
    default:
      return state;
  }
}
