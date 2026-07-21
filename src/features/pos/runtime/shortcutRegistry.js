export const POS_SHORTCUT_EVENT = {
  PRODUCT_TRACE_FOCUS_SEARCH: 'product-trace:focus-search',
};

export const POS_SHORTCUT = {
  PRODUCT_TRACE: {
    id: 'product-trace',
    code: 'KeyF',
    ctrlOrMeta: true,
    preventDefault: true,
    allowWhileEditing: true,
  },
};

export const isEditableKeyboardTarget = (target) => {
  if (!target) return false;

  const element = target instanceof Element ? target : null;
  if (!element) return false;

  const tagName = String(element.tagName || '').toLowerCase();

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.isContentEditable ||
    Boolean(element.closest?.('[contenteditable="true"]'))
  );
};

export const matchesPosShortcut = (event, shortcut) => {
  if (!event || !shortcut) return false;

  const pressedCode = String(event.code || '');
  const requiredCode = String(shortcut.code || '');

  if (!requiredCode || pressedCode !== requiredCode) {
    return false;
  }

  if (shortcut.ctrlOrMeta && !(event.ctrlKey || event.metaKey)) {
    return false;
  }

  return true;
};
