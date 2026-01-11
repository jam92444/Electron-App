// Service for Discounts module

export const getDiscounts = () => window.api.getDiscounts();

export const getDiscountById = (discountId) =>
  window.api.getDiscountById(discountId);

export const createDiscount = (discount) =>
  window.api.createDiscount(discount);

export const updateDiscount = (discountId, discount) =>
  window.api.updateDiscount(discountId, discount);

export const deleteDiscount = (discountId) =>
  window.api.deleteDiscount(discountId);
