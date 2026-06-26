import { useEffect, useRef } from 'react';

/**
 * Custom Hook สำหรับดักจับข้อมูลจากเครื่องสแกนบาร์โค้ด
 * @param {Function} onScanSuccess - ฟังก์ชัน Callback เมื่อการสแกนสำเร็จ
 */
export const useProcurementScanner = (onScanSuccess) => {
  const inputRef = useRef(null);
  const bufferRef = useRef('');

  useEffect(() => {
    const handleKeyPress = (event) => {
      // พฤติกรรมของปืนสแกนเนอร์ทั่วไปจะทำงานเสมือนคีย์บอร์ดที่ส่งข้อความเร็วสูงและลงท้ายด้วย 'Enter'
      if (event.key === 'Enter') {
        if (bufferRef.current.trim()) {
          onScanSuccess(bufferRef.current.trim());
          bufferRef.current = ''; // ล้าง Buffer เพื่อรอรับการสแกนครั้งถัดไป
        }
      } else {
        // บันทึกเฉพาะตัวอักษรปกติ (ป้องกันปุ่มฟังก์ชันพิเศษ เช่น Shift, Alt)
        if (event.key.length === 1) {
          bufferRef.current += event.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onScanSuccess]);

  const focusScanner = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return {
    inputRef,
    focusScanner,
  };
};