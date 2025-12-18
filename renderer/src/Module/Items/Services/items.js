// Service for Items module

// renderer/src/services/items.js
export const getItems = () => window.api.getItems();

export const insertItem = (item) => window.api.insertItem(item);

export const updateItem = (item) => window.api.updateItem(item);

export const deleteItem = (itemID) => window.api.deleteItem(itemID);
