// src/features/cart/api/cartApi.js
import apiClient from '@/utils/apiClient';

// ✅ Sync cart items from local to server
export const syncCartToServer = async (cartItems) => {
  try {
    const response = await apiClient.post('/cart-sync/sync', { items: cartItems });
    return response.data;
  } catch (error) {
    console.error('❌ syncCartToServer error:', error);
    throw error;
  }
};

// ✅ Fetch cart items from server to local
export const fetchCartFromServer = async () => {
  try {
    const response = await apiClient.get('/cart-sync/user');
    return response.data.cartItems || [];
  } catch (error) {
    console.error('❌ fetchCartFromServer error:', error);
    return [];
  }
};

// ✅ Clear server-side cart (after order confirmed or manually)
export const clearServerCart = async () => {
  try {
    const response = await apiClient.delete('/cart-sync/clear');
    return response.data;
  } catch (error) {
    console.error('❌ clearServerCart error:', error);
    throw error;
  }
};

// ✅ Remove single item from server-side cart
export const removeCartItemFromServer = async (productId) => {
  try {
    const response = await apiClient.delete(`/cart-sync/item/${productId}`);
    return response.data;
  } catch (error) {
    console.error('❌ removeCartItemFromServer error:', error);
    throw error;
  }
};

// ✅ Update quantity for specific item in server-side cart
export const updateCartItemQuantity = async (productId, quantity) => {
  try {
    const response = await apiClient.patch(`/cart-sync/item/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('❌ updateCartItemQuantity error:', error);
    throw error;
  }
};

