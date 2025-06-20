import apiClient from "@/utils/apiClient";

export const createOrder = async (orderData) => {
  try {
    const res = await apiClient.post("/order-online", orderData);
    return res.data;
  } catch (err) {
    console.error("❌ createOrder error:", err);
    throw err;
  }
};

export const getAllOrders = async () => {
  try {
    const res = await apiClient.get("/order-online");
    return res.data;
  } catch (err) {
    console.error("❌ getAllOrders error:", err);
    throw err;
  }
};

export const getOrderById = async (id) => {
  try {
    const res = await apiClient.get(`/order-online/${id}`);
    return res.data;
  } catch (err) {
    console.error("❌ getOrderById error:", err);
    throw err;
  }
};

export const updateOrderStatus = async (id, payload) => {
  try {
    const res = await apiClient.patch(`/order-online/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("❌ updateOrderStatus error:", err);
    throw err;
  }
};

export const deleteOrder = async (id) => {
  try {
    const res = await apiClient.delete(`/order-online/${id}`);
    return res.data;
  } catch (err) {
    console.error("❌ deleteOrder error:", err);
    throw err;
  }
};
