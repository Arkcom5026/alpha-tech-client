import * as React from 'react';
import { Button, Dialog } from '../../foundation.jsx';

/**
 * Generic confirmation dialog for user-initiated actions.
 * Business wording and execution remain owned by the consuming feature.
 */
export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  confirmVariant = 'primary',
  intent,
  loading = false,
  loadingLabel = 'กำลังบันทึก...',
  onConfirm,
  onClose,
}) {
  const cancelRef = React.useRef(null);
  const resolvedVariant = intent === 'destructive'
    ? 'danger'
    : intent === 'warning'
      ? 'warning'
      : confirmVariant;

  return (
    <Dialog
      open={Boolean(open)}
      onClose={() => !loading && onClose?.()}
      title={title}
      description={description}
      initialFocusRef={intent === 'destructive' ? cancelRef : undefined}
      footer={(
        <>
          <Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={resolvedVariant}
            loading={loading}
            loadingLabel={loadingLabel}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      )}
    />
  );
}
