
// ✅ src/components/shared/ConfirmDeleteDialog.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ConfirmDeleteDialog = ({
  open,
  itemLabel,
  name,
  description,
  // Backward/forward compatible props
  onCancel,
  onClose,
  onOpenChange,
  onConfirm,
  loading,
}) => {
  const handleCancel = () => {
    try {
      if (typeof onCancel === 'function') return onCancel();
      if (typeof onClose === 'function') return onClose();
    } catch (_) {
      // ignore
    }
  };

  const handleOpenChange = (isOpen) => {
    try {
      if (typeof onOpenChange === 'function') onOpenChange(isOpen);
    } catch (_) {
      // ignore
    }
    if (!isOpen) handleCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name || 'ยืนยันการลบ'}</DialogTitle>
          <DialogDescription>
            {description || 'โปรดตรวจสอบความถูกต้องก่อนยืนยันการลบข้อมูล'}
          </DialogDescription>
        </DialogHeader>
        <div>
          คุณต้องการลบ <span className="font-semibold">"{itemLabel}"</span> ใช่หรือไม่?
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={!!loading}>ยกเลิก</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!!loading}>
            {loading ? 'กำลังลบ…' : 'ยืนยันการลบ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
   

