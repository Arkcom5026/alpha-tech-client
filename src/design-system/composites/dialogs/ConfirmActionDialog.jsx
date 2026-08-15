import * as React from 'react';
import { Button, Dialog } from '../../foundation.jsx';

const intentVariant = {
  default: 'primary',
  primary: 'primary',
  destructive: 'danger',
  danger: 'danger',
};

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
  intent = 'default',
  confirmVariant,
  loading = false,
  loadingLabel = 'กำลังบันทึก...',
  onConfirm,
  onClose,
}) {
  const resolvedVariant = confirmVariant || intentVariant[intent] || intentVariant.default;

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
