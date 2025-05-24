// ✅ src/utils/uiHelpers.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// รวม class tailwind อย่างปลอดภัย
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// แปลงตัวเลขให้เป็นราคาไทย
export const formatPrice = (price) => {
  if (typeof price !== "number") return "-";
  return price.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  });
};
