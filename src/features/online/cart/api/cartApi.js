// src/features/cart/api/cartApi.js
import apiClient from '@/utils/apiClient';

// ✅ Merge local cart with server cart (called after login)
export const mergeCartToServer = async (cartItems) => {
  try {
    const response = await apiClient.post('/cart/merge', { items: cartItems });
    return response.data;
  } catch (error) {
    console.error('❌ mergeCartToServer error:', error);
    throw error;
  }
};

// ✅ Fetch cart items from server to local
export const fetchCartFromServer = async () => {
  try {
    const response = await apiClient.get('/cart');
    return response.data.cartItems || [];
  } catch (error) {
    console.error('❌ fetchCartFromServer error:', error);
    return [];
  }
};

// ✅ Clear server-side cart (after order confirmed or manually)
export const clearServerCart = async () => {
  try {
    const response = await apiClient.delete('/cart');
    return response.data;
  } catch (error) {
    console.error('❌ clearServerCart error:', error);
    throw error;
  }
};

// ✅ Remove single item from server-side cart
export const removeCartItemFromServer = async (productId) => {
  try {
    const response = await apiClient.delete(`/cart/items/${productId}`);
    return response.data;
  } catch (error) {
    console.error('❌ removeCartItemFromServer error:', error);
    throw error;
  }
};

// ✅ Update quantity for specific item in server-side cart
export const updateCartItemQuantity = async (productId, quantity) => {
  try {
    const response = await apiClient.patch(`/cart/item/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('❌ updateCartItemQuantity error:', error);
    throw error;
  }
};

// ✅ Delete selected items from server-side cart (batch delete)
export const deleteSelectedCartItems = async (cartItemIds) => {
  try {
    const response = await apiClient.post('/cart/delete-many', { cartItemIds });
    return response.data;
  } catch (error) {
    console.error('❌ deleteSelectedCartItems error:', error);
    throw error;
  }
};

// ✅ Fetch branch-specific selling prices (used in CheckoutPage)
export const getBranchPrices  = async (branchId) => {
  try {
    const response = await apiClient.get(`/cart/branch-prices/${branchId}`);
    return response.data;
  } catch (error) {
    console.error('❌ fetchBranchPrices error:', error);
    throw error;
  }
};
