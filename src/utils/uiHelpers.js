import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// รวม class tailwind อย่างปลอดภัย
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// แปลงตัวเลขให้เป็นราคาไทย
export const formatPrice = (value) => {
  const normalizedValue = value == null || value === "" ? 0 : Number(value);
  const price = Number.isFinite(normalizedValue) ? normalizedValue : 0;

  return price.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  });
};

// ✅ parseApiError
// แปลง error จาก axios/fetch ให้เป็นข้อความพร้อมใช้ใน UI
export const parseApiError = (error) => {
  try {
    if (!error) return "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";

    // Axios error ที่มี response
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (typeof data === "string") return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
    }

    // Error ปกติ
    if (error.message) return error.message;

    // กรณีเป็น object อื่น ๆ
    return JSON.stringify(error);
  } catch {
    return "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";
  }
};
