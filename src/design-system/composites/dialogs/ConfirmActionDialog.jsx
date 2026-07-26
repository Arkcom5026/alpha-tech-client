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
  loading = false,
  loadingLabel = 'กำลังบันทึก...',
  onConfirm,
  onClose,
}) {
  return (
    <Dialog
      open={Boolean(open)}
      onClose={() => !loading && onClose?.()}
      title={title}
      description={description}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
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
