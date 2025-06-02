// ✅ generateSN.js — ฟังก์ชันสร้าง Serial Number ตามรูปแบบที่กำหนด
// 🔁 Path: src/utils/generateSN.js

export default function generateSN({ prefix = '25', month = '06', start = 1, count = 1 }) {
  return Array.from({ length: count }, (_, i) => {
    const number = String(start + i).padStart(4, '0');
    return `${prefix}${month}${number}`;
  });
}

export function assignSNToReceiptItems(items) {
    let counter = 1;
  
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // ค.ศ. 2025 → '25'
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // เดือน 1-12 → '01'-'12'
  
    return items.map((item) => {
      const snList = [];
  
      for (let i = 0; i < item.quantity; i++) {
        const sn = `${year}${month}${String(counter).padStart(4, '0')}`;
        snList.push(sn);
        counter++;
      }
  
      return {
        ...item,
        generatedSNs: snList,
      };
    });
  }
  