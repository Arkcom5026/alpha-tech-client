import apiClient from "@/utils/apiClient";

export const createOrder = async (orderData) => {
  try {
    const res = await apiClient.post("/orders", orderData);
    return res.data;
  } catch (err) {
    console.error("❌ createOrder error:", err);
    throw err;
  }
};

