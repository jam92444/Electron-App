// renderer/src/services/items.js
export const getSizes = () => window.api.getSizes();

export const insertSize = (size) => window.api.insertSize(size);

export const updateSize = (id, newSize) =>
  window.api.updateSize({ id, newSize });

export const deleteSize = (id) => window.api.deleteSize(id);
