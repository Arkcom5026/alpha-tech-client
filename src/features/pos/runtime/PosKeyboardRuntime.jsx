import usePosKeyboardShortcuts from './usePosKeyboardShortcuts';

/**
 * Global POS keyboard runtime.
 *
 * ติดตั้งเพียงครั้งเดียวที่ POS Master Layout และไม่สร้าง DOM เพิ่ม
 * โมดูลย่อยจึงไม่ต้องผูก window.addEventListener ซ้ำกันเอง
 */
const PosKeyboardRuntime = () => {
  usePosKeyboardShortcuts();
  return null;
};

export default PosKeyboardRuntime;
