import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  isEditableKeyboardTarget,
  matchesPosShortcut,
  POS_SHORTCUT,
  POS_SHORTCUT_EVENT,
} from './shortcutRegistry';

const normalizePath = (value = '') => {
  const normalized = String(value || '').replace(/\/+$/, '');
  return normalized || '/';
};

const usePosKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { shopSlug } = useParams();

  useEffect(() => {
    const handleKeyDown = (event) => {
      const shortcut = POS_SHORTCUT.PRODUCT_TRACE;

      if (!matchesPosShortcut(event, shortcut)) return;

      /*
       * Product Trace เป็น Global POS command:
       * Ctrl+F ต้องทำงานแม้ Cursor อยู่ใน input เพื่อไม่ให้ Chrome Browser Find แย่งคำสั่ง
       * Registry ใช้ event.code (KeyF) จึงทำงานได้ทั้งแป้นพิมพ์ไทยและอังกฤษ
       * เงื่อนไข editable ยังคงรองรับ shortcut อื่นในอนาคตที่ไม่ควรแทรกแซงฟอร์ม
       */
      if (
        shortcut.allowWhileEditing !== true &&
        isEditableKeyboardTarget(event.target)
      ) {
        return;
      }

      if (!shopSlug) return;

      if (shortcut.preventDefault) {
        event.preventDefault();
      }

      const productTracePath = `/${shopSlug}/pos/stock/product-trace`;
      const isOnProductTracePage =
        normalizePath(pathname) === normalizePath(productTracePath);

      if (isOnProductTracePage) {
        window.dispatchEvent(
          new CustomEvent(POS_SHORTCUT_EVENT.PRODUCT_TRACE_FOCUS_SEARCH),
        );
        return;
      }

      navigate(productTracePath);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [navigate, pathname, shopSlug]);
};

export default usePosKeyboardShortcuts;
